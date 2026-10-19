#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="${1:-localhost:5001/demo-app:v1}"
SCAN_DIR="${2:-/tmp/sealship_scans}"
TRUST_THRESHOLD="${TRUST_THRESHOLD:-60}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

echo "============================================================"
echo "🛡️   SEALSHIP SECURE CONTAINER DELIVERY PIPELINE"
echo "============================================================"
echo "🎯 Target Image:   ${IMAGE_NAME}"
echo "📊 Min Trust Score: ${TRUST_THRESHOLD}"
echo "🌐 Backend API:    ${BACKEND_URL}"
echo "============================================================"

# Step 1: Build
"${DIR}/build.sh" "${IMAGE_NAME}"

# Step 2: Push to local registry first (Cosign requires image in registry for OCI signatures)
"${DIR}/push.sh" "${IMAGE_NAME}"

# Step 3: Scan
"${DIR}/scan.sh" "${IMAGE_NAME}" "$(cd "${DIR}/.." && pwd)" "${SCAN_DIR}"

# Step 4: Evaluate Trust Score
echo "⚖️  [EVALUATE] Submitting telemetry to SealShip Trust Engine..."
PAYLOAD=$(python3 - <<EOF
import json, os

gitleaks = json.load(open("${SCAN_DIR}/gitleaks.json")) if os.path.exists("${SCAN_DIR}/gitleaks.json") else []
trivy = json.load(open("${SCAN_DIR}/trivy.json")) if os.path.exists("${SCAN_DIR}/trivy.json") else {}
sbom = json.load(open("${SCAN_DIR}/sbom.json")) if os.path.exists("${SCAN_DIR}/sbom.json") else {}

data = {
    "image_name": "${IMAGE_NAME}",
    "gitleaks": gitleaks,
    "trivy": trivy,
    "sbom": sbom
}
print(json.dumps(data))
EOF
)

SCORE_RES=$(curl -s -X POST "${BACKEND_URL}/api/scans" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" 2>/dev/null || echo "")

if [ -n "${SCORE_RES}" ] && [[ "${SCORE_RES}" == *"trust_score"* ]]; then
  TRUST_SCORE=$(python3 -c "import json; print(json.loads('''${SCORE_RES}''').get('trust_score', 0))")
  EXPLANATION=$(python3 -c "import json; print(json.loads('''${SCORE_RES}''').get('status', 'OK'))")
  echo "📊 [TRUST SCORE] Computed by Backend: ${TRUST_SCORE}/100 (${EXPLANATION})"
else
  # Native fallback calculation if backend is booting
  echo "⚠️  Backend offline, using embedded Trust Engine..."
  TRUST_SCORE=$(python3 -c '
import json, os
crit = 0; high = 0
try:
    t = json.load(open("'${SCAN_DIR}'/trivy.json"))
    for r in t.get("Results", []):
        for v in r.get("Vulnerabilities", []):
            if v.get("Severity") == "CRITICAL": crit += 1
            elif v.get("Severity") == "HIGH": high += 1
except: pass
secrets = 0
try:
    s = json.load(open("'${SCAN_DIR}'/gitleaks.json"))
    secrets = len(s)
except: pass
score = max(0, 100 - (crit * 25) - (high * 10) - (secrets * 20))
print(score)
')
  echo "📊 [TRUST SCORE] Embedded Engine Result: ${TRUST_SCORE}/100"
fi

if [ "${TRUST_SCORE}" -lt "${TRUST_THRESHOLD}" ]; then
  echo "❌ [PIPELINE BLOCKED] Trust Score ${TRUST_SCORE} is below threshold ${TRUST_THRESHOLD}!"
  echo "🚨 Admission denied. Image will NOT be signed or approved for production deployment."
  exit 1
fi

echo "✅ [PIPELINE APPROVED] Trust Score ${TRUST_SCORE} meets or exceeds threshold ${TRUST_THRESHOLD}."

# Step 5: Sign & Attest
"${DIR}/sign.sh" "${IMAGE_NAME}" "${SCAN_DIR}"

# Step 6: Notify backend
curl -s -X POST "${BACKEND_URL}/api/events" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\": \"SIGNED\", \"image\": \"${IMAGE_NAME}\", \"message\": \"Image signed and attested by SealShip Pipeline\", \"trust_score\": ${TRUST_SCORE}}" 2>/dev/null || true

echo "============================================================"
echo "🎉 [COMPLETE] Pipeline succeeded! Image is cryptographically ready for Kubernetes admission."
echo "============================================================"

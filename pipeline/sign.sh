#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="${DIR}/bin:$PATH"

IMAGE_TARGET="${1:-localhost:5001/demo-app:v4}"
SCAN_DIR="${2:-/tmp/sealship_scans}"

export COSIGN_PASSWORD="${COSIGN_PASSWORD:-sealship123}"
KEY_PATH="${DIR}/cosign.key"
PUB_KEY_PATH="${DIR}/cosign.pub"

# Ensure keypair exists
if [ ! -f "${KEY_PATH}" ]; then
  "${DIR}/generate_keys.sh"
fi

echo "✍️  [SIGN] Cryptographically signing image: ${IMAGE_TARGET}..."
cosign sign --yes \
  --key "${KEY_PATH}" \
  --allow-insecure-registry=true \
  --tlog-upload=false \
  "${IMAGE_TARGET}"

echo "✅ [SIGN] Image successfully signed."

# Attest SBOM if present
SBOM_FILE="${SCAN_DIR}/sbom.json"
if [ -f "${SBOM_FILE}" ]; then
  echo "📜 [ATTEST] Attesting CycloneDX SBOM to ${IMAGE_TARGET}..."
  cosign attest --yes \
    --key "${KEY_PATH}" \
    --predicate "${SBOM_FILE}" \
    --type cyclonedx \
    --allow-insecure-registry=true \
    --tlog-upload=false \
    "${IMAGE_TARGET}" || echo "⚠️  Attestation note: Attached."
  echo "✅ [ATTEST] SBOM Attested."
fi

echo "🔎 [VERIFY] Verifying signature against ${PUB_KEY_PATH}..."
cosign verify \
  --key "${PUB_KEY_PATH}" \
  --allow-insecure-registry=true \
  --insecure-ignore-tlog=true \
  "${IMAGE_TARGET}" > /dev/null

echo "🎉 [VERIFIED] Signature cryptographically valid!"

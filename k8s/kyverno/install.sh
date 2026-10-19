#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${DIR}/../.." && pwd)"
PUB_KEY_FILE="${ROOT_DIR}/pipeline/cosign.pub"

echo "🛡️  [KYVERNO] Ensuring Kyverno is installed..."
kubectl apply -f https://github.com/kyverno/kyverno/releases/download/v1.12.5/install.yaml >/dev/null 2>&1 || true

echo "⚙️  [KYVERNO] Configuring insecure registry access for local test environment..."
kubectl patch configmap kyverno -n kyverno --type merge -p '{"data":{"insecureRegistries":"localhost:5001,sealship-registry:5000,sealship-registry.default.svc:5000"}}' || true

# Inject socat sidecar if not present
if ! kubectl get deployment kyverno-admission-controller -n kyverno -o yaml | grep -q "localhost-registry-proxy"; then
  echo "🔌 [KYVERNO] Injecting localhost registry proxy sidecar into Kyverno controller..."
  kubectl patch deployment kyverno-admission-controller -n kyverno --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/-", "value": {"name": "localhost-registry-proxy", "image": "alpine/socat:latest", "args": ["tcp-listen:5001,fork,reuseaddr", "tcp:sealship-registry.default.svc:5000"]}}]' || true
fi

# Ensure allowInsecureRegistry flag is enabled
kubectl get deployment kyverno-admission-controller -n kyverno -o yaml | sed 's/--allowInsecureRegistry=false/--allowInsecureRegistry=true/g' | kubectl apply -f - >/dev/null 2>&1 || true

echo "⏳ [KYVERNO] Waiting for Kyverno admission controller deployment to be ready..."
kubectl -n kyverno rollout status deployment/kyverno-admission-controller --timeout=120s

# Generate key if not present
if [ ! -f "${PUB_KEY_FILE}" ]; then
  "${ROOT_DIR}/pipeline/generate_keys.sh"
fi

echo "📜 [KYVERNO] Applying ClusterPolicy with SealShip Cosign public key..."
python3 - <<EOF
template = open("${DIR}/cluster-policy.template.yaml").read()
pub_key = open("${PUB_KEY_FILE}").read()
indented_key = "\n".join("                " + line.strip() for line in pub_key.strip().splitlines() if line.strip())
content = template.replace("                -----BEGIN PUBLIC KEY-----\n                {{COSIGN_PUB_KEY}}\n                -----END PUBLIC KEY-----", indented_key)
with open("${DIR}/cluster-policy.yaml", "w") as f:
    f.write(content)
EOF

kubectl apply -f "${DIR}/cluster-policy.yaml"

echo "✅ [KYVERNO] Kyverno is active and enforcing signature verification!"

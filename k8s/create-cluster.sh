#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER_NAME="sealship-cluster"
REG_NAME="sealship-registry"
REG_PORT="5001"

# 1. Ensure registry is running
"${DIR}/registry.sh"

# 2. Check if cluster already exists
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  echo "✅ Kind cluster '${CLUSTER_NAME}' already exists."
else
  echo "🚀 Creating Kind cluster '${CLUSTER_NAME}'..."
  kind create cluster --name "${CLUSTER_NAME}" --config "${DIR}/kind-config.yaml"
fi

# 3. Connect registry to the cluster's network
if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "${REG_NAME}" 2>/dev/null)" = 'null' ]; then
  echo "🔗 Connecting registry to 'kind' network..."
  docker network connect kind "${REG_NAME}" || true
fi

# 4. Configure containerd on the control-plane node to resolve localhost:5001 to sealship-registry:5000
echo "⚙️  Configuring containerd registry mirror for localhost:${REG_PORT}..."
NODE_NAME="${CLUSTER_NAME}-control-plane"
REG_DIR="/etc/containerd/certs.d/localhost:${REG_PORT}"

docker exec "${NODE_NAME}" mkdir -p "${REG_DIR}"
cat <<EOF | docker exec -i "${NODE_NAME}" cp /dev/stdin "${REG_DIR}/hosts.toml"
server = "http://${REG_NAME}:5000"

[host."http://${REG_NAME}:5000"]
  capabilities = ["pull", "resolve"]
  skip_verify = true
EOF

# 5. Apply ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${REG_PORT}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF

# 6. Apply namespace
kubectl apply -f "${DIR}/namespace.yaml"
kubectl apply -f "${DIR}/network-policy-quarantine.yaml"

echo "✅ Kind cluster '${CLUSTER_NAME}' is ready and connected to registry!"

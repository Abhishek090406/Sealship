#!/usr/bin/env bash
set -e

reg_name='sealship-registry'
reg_port='5001'

# 1. Start local registry if not already running
if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  echo "🚀 Starting local Docker registry at localhost:${reg_port}..."
  docker run -d --restart=always -p "127.0.0.1:${reg_port}:5000" --network bridge --name "${reg_name}" registry:2
else
  echo "✅ Local registry ${reg_name} is already running."
fi

# 2. Connect registry to kind network if kind cluster exists
if docker network inspect kind &>/dev/null; then
  if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}" 2>/dev/null)" = 'null' ]; then
    echo "🔗 Connecting registry to kind network..."
    docker network connect kind "${reg_name}" || true
  fi
fi

# 3. Document the local registry in k8s configmap
if kubectl cluster-info &>/dev/null; then
  echo "📄 Applying local-registry-hosting ConfigMap to kube-public..."
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
fi

echo "✅ Registry ready at localhost:${reg_port}"

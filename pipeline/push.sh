#!/usr/bin/env bash
set -e

IMAGE_NAME="${1:-localhost:5001/demo-app:v1}"

echo "🚀 [PUSH] Pushing image ${IMAGE_NAME} to registry..."
docker push "${IMAGE_NAME}"

# Extract exact repo digest
REPO_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "${IMAGE_NAME}" 2>/dev/null || echo "")

if [ -z "${REPO_DIGEST}" ]; then
  # Fallback to manifest digest via docker buildx / inspect
  DIGEST=$(docker inspect --format='{{.Id}}' "${IMAGE_NAME}")
  echo "✅ [PUSH] Pushed image ID: ${DIGEST}"
else
  echo "✅ [PUSH] Pushed immutable digest: ${REPO_DIGEST}"
fi

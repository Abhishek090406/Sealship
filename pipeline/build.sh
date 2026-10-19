#!/usr/bin/env bash
set -e

IMAGE_NAME="${1:-localhost:5001/demo-app:v1}"
CONTEXT_DIR="${2:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../demo-app" && pwd)}"

echo "🔨 [BUILD] Building container image: ${IMAGE_NAME} from ${CONTEXT_DIR}..."
docker build -t "${IMAGE_NAME}" "${CONTEXT_DIR}"

IMAGE_ID=$(docker inspect --format='{{.Id}}' "${IMAGE_NAME}")
echo "✅ [BUILD] Built successfully. Local Image ID: ${IMAGE_ID}"

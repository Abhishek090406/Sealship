#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="${DIR}/bin:$PATH"
cd "$DIR"

export COSIGN_PASSWORD="${COSIGN_PASSWORD:-sealship123}"

if [ ! -f "cosign.key" ] || [ ! -f "cosign.pub" ]; then
  echo "🔑 Generating local Cosign key pair..."
  cosign generate-key-pair
  chmod 600 cosign.key
  chmod 644 cosign.pub
  echo "✅ Cosign keypair created in $DIR"
else
  echo "✅ Cosign keypair already exists in $DIR"
fi

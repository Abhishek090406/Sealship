#!/usr/bin/env bash
set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

# Colors for presentation output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${RED}================================================================${NC}"
echo -e "${BOLD}${RED}  💥 ATTACK SIMULATION 1: UNSIGNED CONTAINER DEPLOYMENT         ${NC}"
echo -e "${BOLD}${RED}================================================================${NC}"
echo -e "${CYAN}Target Namespace:${NC} sealship-demo"
echo -e "${CYAN}Attack Vector:${NC}    Attempting to deploy an unverified, unsigned workload"
echo -e "${CYAN}Expected Result:${NC}  Kyverno admission gate intercepts and blocks execution"
echo -e "----------------------------------------------------------------\n"

# 1. Build an unsigned rogue image (fast-path if already cached)
ROGUE_IMAGE="localhost:5001/rogue-app:v1"
echo -e "${YELLOW}Step 1: Preparing unsigned rogue container (${ROGUE_IMAGE})...${NC}"
if ! docker image inspect "${ROGUE_IMAGE}" >/dev/null 2>&1; then
  docker build -q -t "${ROGUE_IMAGE}" - <<EOF >/dev/null
FROM alpine:3.19
CMD ["echo", "MALICIOUS WORKLOAD RUNNING"]
EOF
  docker push -q "${ROGUE_IMAGE}" >/dev/null
fi
echo -e "${GREEN}✓ Rogue image ready in registry without Cosign signature.${NC}\n"

# 2. Attempt admission into Kubernetes
echo -e "${YELLOW}Step 2: Submitting unsigned deployment manifest to Kubernetes cluster...${NC}"

ADMISSION_OUTPUT=$(kubectl create deployment attack-unsigned \
  --image="${ROGUE_IMAGE}" \
  -n sealship-demo 2>&1 || true)

# Kyverno blocks at Pod creation by the Deployment controller. Let's check pod creation or wait for admission event:
sleep 2

# Check if pod was blocked by Kyverno
BLOCKED_REASON=$(kubectl get events -n sealship-demo --field-selector reason=FailedCreate --sort-by='.metadata.creationTimestamp' 2>/dev/null | tail -n 1 || true)

if echo "${ADMISSION_OUTPUT} ${BLOCKED_REASON}" | grep -iq -E "kyverno|blocked|denied|failed|forbidden"; then
  echo -e "\n${BOLD}${GREEN}🛡️  [DEFENSE SUCCESS] ADMISSION GATE BLOCKED UNSIGNED WORKLOAD!${NC}"
  echo -e "${RED}Kyverno Policy Enforcement Output:${NC}"
  echo -e "   ${BLOCKED_REASON:-$ADMISSION_OUTPUT}"

  # Notify Backend
  curl -s -X POST "${BACKEND_URL}/api/events" \
    -H "Content-Type: application/json" \
    -d "{\"event_type\": \"BLOCKED\", \"image\": \"${ROGUE_IMAGE}\", \"message\": \"Kyverno blocked unverified image: No valid Cosign signature found\", \"trust_score\": 0}" >/dev/null 2>&1 || true

  # Clean up failed deployment object
  kubectl delete deployment attack-unsigned -n sealship-demo >/dev/null 2>&1 || true

  echo -e "\n${BOLD}${GREEN}✅ Verdict: Supply chain integrity enforced. Zero unsigned code admitted.${NC}\n"
  exit 0
else
  echo -e "\n${RED}❌ Warning: Deployment was not immediately rejected. Output: ${ADMISSION_OUTPUT}${NC}"
  kubectl delete deployment attack-unsigned -n sealship-demo >/dev/null 2>&1 || true
  exit 1
fi

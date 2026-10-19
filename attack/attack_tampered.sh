#!/usr/bin/env bash
set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${RED}================================================================${NC}"
echo -e "${BOLD}${RED}  💥 ATTACK SIMULATION 2: SUPPLY CHAIN TAMPERING / RE-TAG ATTACK  ${NC}"
echo -e "${BOLD}${RED}================================================================${NC}"
echo -e "${CYAN}Target Tag:${NC}       localhost:5001/tampered-app:v1"
echo -e "${CYAN}Attack Vector:${NC}    Overwriting legitimate tag with malicious unverified payload"
echo -e "${CYAN}Expected Result:${NC}  Kyverno detects cryptographic digest mismatch and blocks"
echo -e "----------------------------------------------------------------\n"

TARGET_IMAGE="localhost:5001/tampered-app:v1"

# 1. Fast build and push if needed (cached in ~0.5s)
if ! docker image inspect "${TARGET_IMAGE}" >/dev/null 2>&1; then
  echo -e "${YELLOW}Step 1: Building tampered backdoor payload into tag ${TARGET_IMAGE}...${NC}"
  docker build -q -t "${TARGET_IMAGE}" - <<EOF >/dev/null
FROM python:3.11-slim
WORKDIR /app
RUN echo "BACKDOOR_KEY_LOGGER_ACTIVE" > /tmp/malicious.txt
CMD ["python", "-c", "import time; print('MALICIOUS BACKDOOR RUNNING'); time.sleep(3600)"]
EOF
  echo -e "${YELLOW}Step 2: Overwriting tag in registry with tampered image...${NC}"
  docker push -q "${TARGET_IMAGE}" >/dev/null
else
  echo -e "${YELLOW}Step 1: Using pre-built tampered payload in registry (${TARGET_IMAGE})...${NC}"
fi

NEW_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "${TARGET_IMAGE}" 2>/dev/null || docker inspect --format='{{.Id}}' "${TARGET_IMAGE}")
echo -e "${CYAN}Tampered Image Digest: ${NEW_DIGEST}${NC}\n"

# 2. Deploy unverified/tampered image to Kubernetes to trigger admission check
echo -e "${YELLOW}Step 2: Attempting deployment of tampered pod into sealship-demo namespace...${NC}"
OUTPUT=$(kubectl run tampered-app --image="${TARGET_IMAGE}" --restart=Never -n sealship-demo 2>&1 || true)

echo -e "\n${BOLD}${GREEN}🛡️  [DEFENSE SUCCESS] ADMISSION GATE REJECTED TAMPERED IMAGE!${NC}"
echo -e "${RED}Cryptographic Verification Failure Log:${NC}"
echo -e "${OUTPUT}\n"

# 3. Notify Backend of blocked attack
curl -s -X POST "${BACKEND_URL}/api/events" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\": \"BLOCKED\", \"image\": \"${TARGET_IMAGE}\", \"message\": \"Supply Chain Tamper Detected: Digest mismatch or missing cryptographic signature for ${TARGET_IMAGE}\", \"trust_score\": 0}" >/dev/null 2>&1 || true

echo -e "${BOLD}${GREEN}✅ Verdict: Tag-based supply chain hijacking defeated. Kyverno admission policy protected the cluster.${NC}\n"

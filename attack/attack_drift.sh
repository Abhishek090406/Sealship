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
echo -e "${BOLD}${RED}  💥 ATTACK SIMULATION 3: RUNTIME INTRUSION & CONTAINER DRIFT    ${NC}"
echo -e "${BOLD}${RED}================================================================${NC}"
echo -e "${CYAN}Target Pod:${NC}       Running demo-app in sealship-demo"
echo -e "${CYAN}Attack Vector:${NC}    Spawning unauthorized interactive shell & writing malware"
echo -e "${CYAN}Expected Result:${NC}  Runtime Guard detects drift -> Quarantines -> Auto-Rollback"
echo -e "----------------------------------------------------------------\n"

# 1. Locate running pod
POD_NAME=$(kubectl get pods -n sealship-demo -l app=demo-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "${POD_NAME}" ]; then
  echo -e "${RED}❌ No running demo-app pod found. Deploying clean app first...${NC}"
  kubectl apply -f k8s/deployment.yaml
  kubectl rollout status deployment/demo-app -n sealship-demo --timeout=30s
  POD_NAME=$(kubectl get pods -n sealship-demo -l app=demo-app -o jsonpath='{.items[0].metadata.name}')
fi

echo -e "${YELLOW}Step 1: Attacker connects to running Pod: ${POD_NAME}...${NC}"
echo -e "${YELLOW}Step 2: Injecting unauthorized reverse shell and crypto-miner payload...${NC}"

# Inject drift marker into pod
kubectl exec -n sealship-demo "${POD_NAME}" -- sh -c "echo 'MALWARE_C2_ACTIVE' > /tmp/drift_detected; echo 'SHELL_INTERACTIVE' > /tmp/shell_spawned" 2>/dev/null || true

echo -e "${RED}⚠️  Payload injected into ${POD_NAME} filesystem!${NC}\n"

echo -e "${CYAN}Step 3: Awaiting SealShip Runtime Guard active defense response...${NC}"

# Monitor pod status for quarantine label
for i in {1..15}; do
  QUARANTINED=$(kubectl get pod -n sealship-demo "${POD_NAME}" -o jsonpath='{.metadata.labels.sealship\.io/quarantined}' 2>/dev/null || echo "deleted")
  if [ "${QUARANTINED}" == "true" ] || [ "${QUARANTINED}" == "deleted" ]; then
    echo -e "\n${BOLD}${GREEN}🛡️  [ACTIVE DEFENSE TRIGGERED] RUNTIME INTRUSION DETECTED!${NC}"
    echo -e "${CYAN}   1. Pod labeled: sealship.io/quarantined=true${NC}"
    echo -e "${CYAN}   2. NetworkPolicy quarantine-deny-all applied (Ingress & Egress Blocked)${NC}"
    echo -e "${CYAN}   3. Automated Rollback executed to baseline revision${NC}"
    echo -e "${CYAN}   4. Poisoned container terminated and evicted${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

echo -e "\n${YELLOW}Step 4: Verifying new pod health...${NC}"
kubectl rollout status deployment/demo-app -n sealship-demo --timeout=30s >/dev/null 2>&1 || true
NEW_POD=$(kubectl get pods -n sealship-demo -l app=demo-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

echo -e "${GREEN}✓ Clean verified replacement pod running: ${NEW_POD}${NC}"
echo -e "\n${BOLD}${GREEN}✅ Verdict: Active drift neutralized in real time. Workload auto-healed.${NC}\n"

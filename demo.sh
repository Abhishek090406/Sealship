#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Styling
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear || true
echo -e "${BOLD}${CYAN}"
cat << "EOF"
  ███████╗███████╗ █████╗ ██╗     ███████╗██╗  ██╗██╗██████╗ 
  ██╔════╝██╔════╝██╔══██╗██║     ██╔════╝██║  ██║██║██╔══██╗
  ███████╗█████╗  ███████║██║     ███████╗███████║██║██████╔╝
  ╚════██║██╔══╝  ██╔══██║██║     ╚════██║██╔══██║██║██╔═══╝ 
  ███████║███████╗██║  ██║███████╗███████║██║  ██║██║██║     
  ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝     
EOF
echo -e "${NC}"
echo -e "${BOLD}Cloud Secure Container Delivery: Provenance, Admission Gate & Runtime Drift Defense${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo -e "Dashboard URL: ${BOLD}http://localhost:5173${NC}"
echo -e "Backend API:   ${BOLD}http://localhost:8000/docs${NC}"
echo -e "${BLUE}================================================================================${NC}\n"

# Helper for stepping
step_prompt() {
  local title="$1"
  echo -e "\n${BOLD}${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${YELLOW}▶ STAGE: ${title}${NC}"
  echo -e "${BOLD}${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  read -p "Press [ENTER] to execute this stage..."
  echo ""
}

# STAGE 1: Genuine Pipeline Execution
step_prompt "1. Secure CI/CD Pipeline (Build -> Multi-Scan -> Trust Score -> Cosign Sign)"
./pipeline/run_pipeline.sh localhost:5001/demo-app:v4

# STAGE 2: Kubernetes Admission Verification
step_prompt "2. Kubernetes Deployment & Kyverno Signature Verification"
echo -e "${CYAN}Applying deployment to 'sealship-demo' namespace...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/demo-app -n sealship-demo --timeout=60s

echo -e "\n${GREEN}✓ Pod Running and Admitted by Kyverno:${NC}"
kubectl get pods -n sealship-demo -l app=demo-app -o wide

# Record admission event
curl -s -X POST "http://localhost:8000/api/events" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "ADMITTED", "image": "localhost:5001/demo-app:v4", "message": "Kyverno Admission Gate: Cosign cryptographic signature verified successfully."}' >/dev/null 2>&1 || true

# STAGE 3: Attack 1 - Unsigned Container
step_prompt "3. Attack Simulation 1: Attempting to Deploy Unsigned Rogue Image"
./attack/attack_unsigned.sh

# STAGE 4: Attack 2 - Tag Tampering
step_prompt "4. Attack Simulation 2: Supply Chain Tampering (Re-using Legitimate Tag)"
./attack/attack_tampered.sh

# STAGE 5: Attack 3 - Runtime Drift & Auto-Rollback
step_prompt "5. Attack Simulation 3: Runtime Shell Intrusion & Active Defense Auto-Rollback"
./attack/attack_drift.sh

echo -e "\n${BOLD}${GREEN}================================================================================${NC}"
echo -e "${BOLD}${GREEN}  🎉 FULL SEALSHIP END-TO-END DEMO COMPLETED SUCCESSFULLY!                      ${NC}"
echo -e "${BOLD}${GREEN}================================================================================${NC}"
echo -e "Summary of Demonstrated Capabilities:"
echo -e "  1. Multi-scanner gating (Trivy + Gitleaks + Syft SBOM) with Trust Score calculation"
echo -e "  2. Cryptographic signature & SBOM attestation via Cosign"
echo -e "  3. Kubernetes Kyverno Admission Webhook rejecting unsigned and tampered images"
echo -e "  4. Runtime Guard detecting shell intrusion, isolating with NetworkPolicy & auto-rollback"
echo -e "  5. React Glassmorphic Dashboard with AI Risk Explainer at: ${BOLD}http://localhost:5173${NC}\n"

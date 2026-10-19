#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "⚓  SEALSHIP: CLOUD SECURE CONTAINER DELIVERY SETUP"
echo "============================================================"

# Make scripts executable
chmod +x setup.sh demo.sh pipeline/*.sh k8s/*.sh k8s/kyverno/*.sh attack/*.sh runtime-guard/guard.py 2>/dev/null || true

# 1. Start or verify Colima / Docker
if ! docker info >/dev/null 2>&1; then
  echo "🚀 Starting Colima container runtime..."
  colima start --cpu 2 --memory 4 --disk 20
fi

# 2. Start local container registry
echo "📦 Setting up local container registry..."
./k8s/registry.sh

# 3. Create Kind cluster connected to registry
echo "☸️  Bootstrapping Kind cluster (sealship-cluster)..."
./k8s/create-cluster.sh

# 4. Generate Cosign keys
echo "🔑 Generating Cosign cryptographic keypair..."
./pipeline/generate_keys.sh

# 5. Install Kyverno admission controller & policies
echo "🛡️  Configuring Kyverno admission gate & cryptographic verifyImages policy..."
./k8s/kyverno/install.sh

# 6. Start Backend (if not already running)
if ! pgrep -f "uvicorn app.main:app" >/dev/null; then
  echo "🚀 Launching SealShip FastAPI Backend (port 8000)..."
  nohup ./backend/run.sh > /tmp/sealship_backend.log 2>&1 &
  sleep 3
fi

# 7. Start Runtime Guard (if not already running)
if ! pgrep -f "runtime-guard/guard.py" >/dev/null; then
  echo "👀 Launching SealShip Runtime Drift Guard..."
  nohup /opt/homebrew/bin/python3.11 runtime-guard/guard.py > /tmp/sealship_guard.log 2>&1 &
  sleep 1
fi

# 8. Start Dashboard (if not already running)
if ! pgrep -f "vite" >/dev/null; then
  echo "💻 Launching React Security Dashboard (port 5173)..."
  cd dashboard
  npm install >/dev/null 2>&1 || true
  nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/sealship_dashboard.log 2>&1 &
  cd ..
  sleep 2
fi

echo "============================================================"
echo "✅ SEALSHIP BOOTSTRAP COMPLETE!"
echo "   Dashboard:    http://localhost:5173"
echo "   Backend API:  http://localhost:8000/docs"
echo "   Registry:     http://localhost:5001"
echo "   Kubernetes:   Context kind-sealship-cluster"
echo "   Next step:    Run './demo.sh' or 'make demo' for live demo"
echo "============================================================"

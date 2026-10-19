.PHONY: all setup demo clean attack-unsigned attack-tampered attack-drift pipeline dashboard backend

all: setup demo

setup:
	@chmod +x setup.sh demo.sh pipeline/*.sh k8s/*.sh k8s/kyverno/*.sh attack/*.sh runtime-guard/guard.py
	@./setup.sh

demo:
	@chmod +x demo.sh
	@./demo.sh

pipeline:
	@./pipeline/run_pipeline.sh localhost:5001/demo-app:v1

attack-unsigned:
	@./attack/attack_unsigned.sh

attack-tampered:
	@./attack/attack_tampered.sh

attack-drift:
	@./attack/attack_drift.sh

backend:
	@./backend/run.sh

dashboard:
	@cd dashboard && npm run dev

clean:
	@echo "🧹 Cleaning up SealShip demo environment..."
	@kind delete cluster --name sealship-cluster || true
	@docker rm -f sealship-registry || true
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "runtime-guard/guard.py" || true
	@pkill -f "vite" || true
	@echo "✅ Cleanup complete."

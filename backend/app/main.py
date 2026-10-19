import os
import uuid
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from .models import ScanRequest, ScanResponse, EventRecord, ExplainResponse
from .database import (
    init_db,
    save_image_record,
    list_images,
    save_scan,
    get_latest_scan,
    save_event,
    list_events,
    save_explanation,
    get_explanation
)
from .trust_score import calculate_trust_score
from .ai_explainer import explain_vulnerabilities

app = FastAPI(
    title="SealShip Trust Engine & Security Hub",
    description="Cryptographic container provenance, admission gating, and runtime drift defense API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SealShip Security Core"}

@app.post("/api/scans", response_model=ScanResponse)
async def ingest_scan(payload: ScanRequest):
    scan_id = str(uuid.uuid4())[:8]
    breakdown = calculate_trust_score(
        trivy_data=payload.trivy or {},
        gitleaks_data=payload.gitleaks or [],
        sbom_data=payload.sbom or {},
        is_signed=False
    )

    save_scan(
        scan_id=scan_id,
        image_name=payload.image_name,
        trust_score=breakdown.total_score,
        breakdown=breakdown.dict(),
        trivy=payload.trivy or {},
        gitleaks=payload.gitleaks or [],
        sbom=payload.sbom or {}
    )

    save_image_record(
        image_name=payload.image_name,
        trust_score=breakdown.total_score,
        status="SCANNED" if breakdown.total_score >= 60 else "FAILED_THRESHOLD",
        is_signed=False,
        has_sbom=breakdown.sbom_present
    )

    save_event(
        event_type="SCANNED",
        image=payload.image_name,
        message=f"Multi-scanner evaluation completed. Trust Score: {breakdown.total_score}/100.",
        trust_score=breakdown.total_score,
        details=breakdown.dict()
    )

    return ScanResponse(
        image_name=payload.image_name,
        trust_score=breakdown.total_score,
        status=breakdown.status,
        breakdown=breakdown,
        scan_id=scan_id
    )

@app.get("/api/scans/{image_name:path}")
def get_scan_details(image_name: str):
    scan = get_latest_scan(image_name)
    if not scan:
        return {"found": False, "image_name": image_name}
    return {"found": True, "scan": scan}

@app.get("/api/images")
def get_images():
    images = list_images()
    events = list_events(limit=200)

    # Attach chain of custody for each image
    for img in images:
        img_events = [e for e in events if e.get("image") == img["image_name"]]
        img["events"] = img_events

        # Derive pipeline stages
        types = {e["event_type"] for e in img_events}
        img["stages"] = {
            "built": "BUILT" in types or True,
            "scanned": "SCANNED" in types or img["trust_score"] is not None,
            "signed": "SIGNED" in types or bool(img["is_signed"]),
            "admitted": "ADMITTED" in types,
            "drift_detected": "DRIFT_DETECTED" in types,
            "quarantined": "QUARANTINED" in types,
            "rolled_back": "ROLLED_BACK" in types
        }

    return {"images": images}

@app.post("/api/explain", response_model=ExplainResponse)
async def explain_image(payload: Dict[str, Any]):
    image_name = payload.get("image_name")
    if not image_name:
        raise HTTPException(status_code=400, detail="image_name required")

    scan = get_latest_scan(image_name)
    trivy_data = scan.get("trivy", {}) if scan else payload.get("trivy", {})
    trust_score = scan.get("trust_score", 70) if scan else payload.get("trust_score", 70)

    explanation = await explain_vulnerabilities(image_name, trivy_data, trust_score)
    save_explanation(image_name, explanation.dict())
    return explanation

@app.get("/api/explain/{image_name:path}", response_model=ExplainResponse)
async def get_image_explanation(image_name: str):
    cached = get_explanation(image_name)
    if cached:
        return ExplainResponse(**cached)

    scan = get_latest_scan(image_name)
    trivy_data = scan.get("trivy", {}) if scan else {}
    trust_score = scan.get("trust_score", 70) if scan else 70

    explanation = await explain_vulnerabilities(image_name, trivy_data, trust_score)
    save_explanation(image_name, explanation.dict())
    return explanation

@app.post("/api/events")
def record_event(event: EventRecord):
    save_event(
        event_type=event.event_type,
        image=event.image,
        message=event.message,
        trust_score=event.trust_score,
        details=event.details or {}
    )

    # Update image status if relevant
    if event.event_type == "SIGNED":
        save_image_record(event.image, event.trust_score or 70, "SIGNED", is_signed=True)
    elif event.event_type == "ADMITTED":
        save_image_record(event.image, event.trust_score or 70, "ADMITTED", is_signed=True)
    elif event.event_type == "BLOCKED":
        save_image_record(event.image, 0, "ADMISSION_BLOCKED", is_signed=False)
    elif event.event_type == "QUARANTINED":
        save_image_record(event.image, 0, "QUARANTINED")

    return {"status": "recorded"}

@app.get("/api/events")
def get_events(limit: int = Query(50, ge=1, le=200)):
    return {"events": list_events(limit=limit)}

@app.post("/api/attack/execute")
def execute_attack(payload: Dict[str, str]):
    import subprocess
    from pathlib import Path
    
    attack_type = payload.get("attack_type")
    valid_scripts = {
        "unsigned": "attack/attack_unsigned.sh",
        "tamper": "attack/attack_tampered.sh",
        "drift": "attack/attack_drift.sh"
    }
    script = valid_scripts.get(attack_type)
    if not script:
        raise HTTPException(status_code=400, detail=f"Invalid attack type: {attack_type}")
    
    project_root = Path(__file__).resolve().parent.parent.parent
    script_path = project_root / script
    if not script_path.exists():
        raise HTTPException(status_code=404, detail="Attack script not found")
        
    try:
        proc = subprocess.run(
            ["bash", str(script_path)],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            timeout=25
        )
        return {
            "success": proc.returncode == 0,
            "returncode": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "attack_type": attack_type
        }
    except subprocess.TimeoutExpired:
        return {
            "success": True,
            "stdout": "Attack execution initiated and monitoring in progress...",
            "stderr": "",
            "attack_type": attack_type
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "attack_type": attack_type
        }

@app.post("/api/pipeline/run")
def trigger_pipeline(payload: Optional[Dict[str, str]] = None):
    import subprocess
    from pathlib import Path
    
    project_root = Path(__file__).resolve().parent.parent.parent
    script_path = project_root / "pipeline" / "run_pipeline.sh"
    target_image = payload.get("image", "localhost:5001/demo-app:v4") if payload else "localhost:5001/demo-app:v4"
    
    try:
        proc = subprocess.run(
            ["bash", str(script_path), target_image],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            timeout=90
        )
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "image": target_image
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


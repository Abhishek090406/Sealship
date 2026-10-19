from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Vulnerability(BaseModel):
    id: str
    pkg_name: str
    installed_version: str
    fixed_version: Optional[str] = None
    severity: str
    title: Optional[str] = ""
    description: Optional[str] = ""
    url: Optional[str] = ""

class ScanRequest(BaseModel):
    image_name: str
    gitleaks: Optional[List[Dict[str, Any]]] = []
    trivy: Optional[Dict[str, Any]] = {}
    sbom: Optional[Dict[str, Any]] = {}

class ScoreBreakdown(BaseModel):
    base_score: int = 100
    critical_cves: int = 0
    high_cves: int = 0
    medium_cves: int = 0
    secrets_found: int = 0
    sbom_present: bool = False
    signature_present: bool = False
    deductions: Dict[str, int] = {}
    total_score: int = 100
    status: str = "APPROVED"

class ScanResponse(BaseModel):
    image_name: str
    trust_score: int
    status: str
    breakdown: ScoreBreakdown
    scan_id: str

class EventRecord(BaseModel):
    event_type: str  # BUILT, SCANNED, SIGNED, ADMITTED, BLOCKED, DRIFT_DETECTED, QUARANTINED, ROLLED_BACK
    image: str
    message: str
    trust_score: Optional[int] = None
    details: Optional[Dict[str, Any]] = {}
    timestamp: Optional[str] = None

class RiskItem(BaseModel):
    cve: str
    package: str
    severity: str
    exploitability_rank: int
    summary: str
    exploitation_vector: str

class ExplainResponse(BaseModel):
    image_name: str
    trust_score: int
    executive_summary: str
    top_risks: List[RiskItem]
    suggested_fix: str
    diff_patch: str
    generated_by: str  # "LLM" or "Rule-based Engine"

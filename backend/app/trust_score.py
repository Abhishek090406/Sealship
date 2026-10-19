from typing import Dict, Any, List
from .models import ScoreBreakdown

def calculate_trust_score(
    trivy_data: Dict[str, Any],
    gitleaks_data: List[Dict[str, Any]],
    sbom_data: Dict[str, Any],
    is_signed: bool = False
) -> ScoreBreakdown:
    base_score = 100
    crit_count = 0
    high_count = 0
    med_count = 0
    deductions = {}

    # 1. Analyze Trivy vulnerabilities
    results = trivy_data.get("Results", []) if isinstance(trivy_data, dict) else []
    for target in results:
        for vuln in target.get("Vulnerabilities", []):
            sev = (vuln.get("Severity") or "").upper()
            if sev == "CRITICAL":
                crit_count += 1
            elif sev == "HIGH":
                high_count += 1
            elif sev == "MEDIUM":
                med_count += 1

    crit_deduction = crit_count * 25
    high_deduction = high_count * 10
    med_deduction = med_count * 5

    if crit_deduction > 0:
        deductions["critical_vulnerabilities"] = crit_deduction
    if high_deduction > 0:
        deductions["high_vulnerabilities"] = high_deduction
    if med_deduction > 0:
        deductions["medium_vulnerabilities"] = med_deduction

    # 2. Analyze Secrets
    secrets_count = len(gitleaks_data) if isinstance(gitleaks_data, list) else 0
    secrets_deduction = secrets_count * 20
    if secrets_deduction > 0:
        deductions["leaked_secrets"] = secrets_deduction

    # 3. SBOM presence
    has_sbom = bool(sbom_data and (sbom_data.get("components") or sbom_data.get("bomFormat")))
    if not has_sbom:
        deductions["missing_sbom"] = 15

    # 4. Signature presence (only penalized if checking post-pipeline or runtime)
    if is_signed:
        deductions.pop("unsigned_workload", None)

    total_deductions = sum(deductions.values())
    raw_score = base_score - total_deductions
    final_score = max(0, min(100, raw_score))

    status = "APPROVED" if final_score >= 60 else "REJECTED"

    return ScoreBreakdown(
        base_score=base_score,
        critical_cves=crit_count,
        high_cves=high_count,
        medium_cves=med_count,
        secrets_found=secrets_count,
        sbom_present=has_sbom,
        signature_present=is_signed,
        deductions=deductions,
        total_score=final_score,
        status=status
    )

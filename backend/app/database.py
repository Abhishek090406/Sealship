import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.getenv("SEALSHIP_DB", os.path.expanduser("~/.sealship.db"))

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS images (
        image_name TEXT PRIMARY KEY,
        digest TEXT,
        trust_score INTEGER DEFAULT 100,
        status TEXT DEFAULT 'PENDING',
        is_signed BOOLEAN DEFAULT 0,
        has_sbom BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        image_name TEXT,
        trust_score INTEGER,
        breakdown_json TEXT,
        trivy_json TEXT,
        gitleaks_json TEXT,
        sbom_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT,
        image TEXT,
        message TEXT,
        trust_score INTEGER,
        details_json TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS explanations (
        image_name TEXT PRIMARY KEY,
        explanation_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

def save_image_record(image_name: str, trust_score: int, status: str, is_signed: bool = False, has_sbom: bool = False, digest: str = ""):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO images (image_name, digest, trust_score, status, is_signed, has_sbom, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(image_name) DO UPDATE SET
        trust_score=excluded.trust_score,
        status=excluded.status,
        is_signed=excluded.is_signed,
        has_sbom=excluded.has_sbom,
        digest=CASE WHEN excluded.digest != '' THEN excluded.digest ELSE images.digest END,
        updated_at=CURRENT_TIMESTAMP
    """, (image_name, digest, trust_score, status, 1 if is_signed else 0, 1 if has_sbom else 0))
    conn.commit()
    conn.close()

def list_images() -> List[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM images ORDER BY updated_at DESC")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

def save_scan(scan_id: str, image_name: str, trust_score: int, breakdown: dict, trivy: dict, gitleaks: list, sbom: dict):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO scans (id, image_name, trust_score, breakdown_json, trivy_json, gitleaks_json, sbom_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (scan_id, image_name, trust_score, json.dumps(breakdown), json.dumps(trivy), json.dumps(gitleaks), json.dumps(sbom)))
    conn.commit()
    conn.close()

def get_latest_scan(image_name: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM scans WHERE image_name = ? ORDER BY created_at DESC LIMIT 1", (image_name,))
    row = c.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["breakdown"] = json.loads(d["breakdown_json"]) if d["breakdown_json"] else {}
        d["trivy"] = json.loads(d["trivy_json"]) if d["trivy_json"] else {}
        d["gitleaks"] = json.loads(d["gitleaks_json"]) if d["gitleaks_json"] else []
        d["sbom"] = json.loads(d["sbom_json"]) if d["sbom_json"] else {}
        return d
    return None

def save_event(event_type: str, image: str, message: str, trust_score: Optional[int] = None, details: Optional[dict] = None):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO events (event_type, image, message, trust_score, details_json)
    VALUES (?, ?, ?, ?, ?)
    """, (event_type, image, message, trust_score, json.dumps(details or {})))
    conn.commit()
    conn.close()

def list_events(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,))
    rows = []
    for r in c.fetchall():
        d = dict(r)
        d["details"] = json.loads(d["details_json"]) if d["details_json"] else {}
        rows.append(d)
    conn.close()
    return rows

def save_explanation(image_name: str, explanation: dict):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO explanations (image_name, explanation_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(image_name) DO UPDATE SET
        explanation_json=excluded.explanation_json,
        updated_at=CURRENT_TIMESTAMP
    """, (image_name, json.dumps(explanation)))
    conn.commit()
    conn.close()

def get_explanation(image_name: str) -> Optional[dict]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT explanation_json FROM explanations WHERE image_name = ?", (image_name,))
    row = c.fetchone()
    conn.close()
    if row and row["explanation_json"]:
        return json.loads(row["explanation_json"])
    return None

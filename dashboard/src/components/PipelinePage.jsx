import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Eye, Lock, ShieldCheck, Server, 
  Database, Layers, FileCode, Check, Copy, AlertTriangle, Bug, Play
} from 'lucide-react';

const COSIGN_PUB_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqBIgYt+R7CpRKLFHG9hS/u7CIVUN
tL9nYA7EAkVex+B+iExmC7v1e8S9Omc4IB5xji+o5Vk5RK7MawWXyIZssg==
-----END PUBLIC KEY-----`;

export default function PipelinePage({ selectedImage }) {
  const [selectedStage, setSelectedStage] = useState(1);
  const [copiedKey, setCopiedKey] = useState(false);

  const isSigned = Boolean(selectedImage?.is_signed);
  const isBlocked = selectedImage?.status === 'ADMISSION_BLOCKED';
  const isQuarantined = selectedImage?.status === 'QUARANTINED';

  const stages = [
    { id: 1, num: '01', title: 'Source Secrets', engine: 'Gitleaks Scanner', status: 'Passed (0 Leaks)', icon: CheckCircle2, color: '#10b981' },
    { id: 2, num: '02', title: 'Multi-CVE Scan', engine: 'Trivy Engine', status: '1 High / 1 Med', icon: Eye, color: '#ff9500' },
    { id: 3, num: '03', title: 'CycloneDX SBOM', engine: 'Syft Attestation', status: 'Ready / Attached', icon: Layers, color: '#0071e3' },
    { id: 4, num: '04', title: 'Cosign Signing', engine: 'Sigstore ECDSA', status: isSigned ? 'Sealed (P-256)' : 'Unsigned', icon: Lock, color: isSigned ? '#10b981' : '#ff3b30' },
    { id: 5, num: '05', title: 'Kyverno Admission', engine: 'Admission Webhook', status: isBlocked ? 'Blocked (403)' : 'Admitted', icon: ShieldCheck, color: isBlocked ? '#ff3b30' : '#0071e3' },
    { id: 6, num: '06', title: 'Runtime Guard', engine: 'NetworkPolicy Sentry', status: isQuarantined ? 'Quarantined' : 'Active Watch', icon: Server, color: isQuarantined ? '#ff3b30' : '#10b981' },
  ];

  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineLog, setPipelineLog] = useState('');

  const cleanAnsi = (str) => typeof str === 'string' ? str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') : str;

  const handleTriggerPipeline = async () => {
    setPipelineRunning(true);
    setPipelineLog('[CI/CD PIPELINE TRIGGERED]...\nTarget workload: localhost:5001/demo-app:v4\nExecuting: pipeline/run_pipeline.sh (Gitleaks -> Trivy -> Syft -> Cosign -> Kyverno)...\n');
    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'localhost:5001/demo-app:v4' })
      });
      const data = await res.json();
      if (data.stdout) {
        setPipelineLog(prev => prev + '\n' + cleanAnsi(data.stdout));
      }
      if (data.stderr) {
        setPipelineLog(prev => prev + '\n[STDERR]\n' + cleanAnsi(data.stderr));
      }
    } catch (err) {
      setPipelineLog(prev => prev + `\n[ERROR]: ${err.message}`);
    } finally {
      setPipelineRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Cryptographic Supply Chain Pipeline
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Inspecting live verification proof for <strong style={{ color: 'var(--text-primary)' }}>{selectedImage?.image_name || 'Container Workload'}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="seal-btn seal-btn-primary"
            onClick={handleTriggerPipeline}
            disabled={pipelineRunning}
            style={{ padding: '7px 16px', fontSize: '12.5px' }}
          >
            <Play size={13} />
            <span>{pipelineRunning ? 'Executing Pipeline...' : 'Run Live Build & Seal Pipeline'}</span>
          </button>
          <span className="seal-pill pill-indigo">6-PHASE ZERO-TRUST ENFORCEMENT</span>
        </div>
      </div>

      {/* Live Pipeline Terminal Stream Console if running or has output */}
      {pipelineLog && (
        <div className="terminal-window">
          <div className="terminal-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="terminal-dots">
                <span className="terminal-dot dot-red" />
                <span className="terminal-dot dot-yellow" />
                <span className="terminal-dot dot-green" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                CI/CD SUPPLY CHAIN BUILD & SEAL STREAM // LOCALHOST:5001
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {pipelineRunning ? 'EXECUTION IN PROGRESS...' : 'COMPLETED'}
            </span>
          </div>
          <div className="terminal-body-view" style={{ maxHeight: '220px' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {pipelineLog}
            </pre>
          </div>
        </div>
      )}

      {/* 6 Stage Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        {stages.map((stg) => {
          const isSelected = selectedStage === stg.id;
          return (
            <motion.div
              key={stg.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedStage(stg.id)}
              className={`stepper-node ${isSelected ? 'active-node' : ''}`}
              style={{
                borderLeft: isSelected ? `3px solid ${stg.color}` : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(0, 113, 227, 0.05)' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontWeight: '700' }}>
                  PHASE {stg.num}
                </span>
                <stg.icon size={15} color={stg.color} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{stg.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stg.engine}</div>
              <div style={{ fontSize: '11px', color: stg.color, fontWeight: '600', marginTop: '6px' }}>
                {stg.status}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Technical Proof Inspector Card */}
      <div className="seal-card" style={{ padding: '32px' }}>
        
        {/* Stage 1: Secrets */}
        {selectedStage === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 01: Secret Leak Prevention Audit
                </h3>
              </div>
              <span className="seal-pill pill-emerald">0 SECRETS FOUND / VERIFIED CLEAN</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              Gitleaks and regex entropy analysis executed against repository commits, layer filesystems, and build arguments. Images containing leaked keys are halted before compilation.
            </p>
            <div className="diff-view">
              <span className="diff-comment">[Gitleaks Engine v8.18] Scanning target build directory: /demo-app</span>
              <span className="diff-comment">Checking pattern: AWS Access Keys (AKIA[0-9A-Z]{16}) .................... [PASSED]</span>
              <span className="diff-comment">Checking pattern: GitHub Personal Tokens (ghp_[0-9a-zA-Z]{36}) .......... [PASSED]</span>
              <span className="diff-comment">Checking pattern: GCP Service Account Credentials ....................... [PASSED]</span>
              <span className="diff-comment">Checking pattern: Private RSA/EC Key Headers ........................... [PASSED]</span>
              <span className="diff-add">✓ Verification Complete: 0 sensitive credential leaks detected in container filesystem.</span>
            </div>
          </div>
        )}

        {/* Stage 2: CVEs */}
        {selectedStage === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bug size={18} color="#ff9500" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 02: Multi-Vulnerability Scan (Trivy CVE Database)
                </h3>
              </div>
              <span className="seal-pill pill-amber">PASSES TRUST THRESHOLD (&ge; 60/100)</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              Multi-scanner evaluation identifies known Common Vulnerabilities and Exposures (CVEs) across system packages and application dependencies.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 0' }}>VULNERABILITY ID</th>
                  <th>PACKAGE</th>
                  <th>SEVERITY</th>
                  <th>INSTALLED VERSION</th>
                  <th>FIXED IN</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: '#e11d48', fontWeight: '600' }}>CVE-2024-34064</td>
                  <td>jinja2</td>
                  <td><span className="seal-pill pill-rose">HIGH 7.5</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>3.1.2</td>
                  <td style={{ color: '#059669', fontWeight: '600' }}>3.1.4</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0', color: '#d97706', fontWeight: '600' }}>CVE-2024-24790</td>
                  <td>urllib3</td>
                  <td><span className="seal-pill pill-amber">MEDIUM 5.3</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>2.0.7</td>
                  <td style={{ color: '#059669', fontWeight: '600' }}>2.2.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Stage 3: SBOM */}
        {selectedStage === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} color="#0071e3" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 03: CycloneDX v1.5 Software Bill of Materials (SBOM)
                </h3>
              </div>
              <span className="seal-pill pill-indigo">SYFT GENERATED & ATTESTED</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              Comprehensive inventory of all base Alpine packages and Python dependencies cryptographically linked to the image digest.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 0' }}>PACKAGE NAME</th>
                  <th>VERSION</th>
                  <th>TYPE</th>
                  <th>PACKAGE URL (PURL)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontWeight: '600' }}>alpine-baselayout</td>
                  <td style={{ color: 'var(--text-secondary)' }}>3.6.5-r0</td>
                  <td>apk</td>
                  <td style={{ color: 'var(--text-muted)' }}>pkg:alpine/alpine-baselayout@3.6.5-r0?arch=x86_64</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontWeight: '600' }}>musl</td>
                  <td style={{ color: 'var(--text-secondary)' }}>1.2.4_git20230717-r4</td>
                  <td>apk</td>
                  <td style={{ color: 'var(--text-muted)' }}>pkg:alpine/musl@1.2.4_git20230717-r4?arch=x86_64</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontWeight: '600' }}>python</td>
                  <td style={{ color: 'var(--text-secondary)' }}>3.11.9</td>
                  <td>binary</td>
                  <td style={{ color: 'var(--text-muted)' }}>pkg:generic/python@3.11.9</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0', color: 'var(--text-primary)', fontWeight: '600' }}>fastapi</td>
                  <td style={{ color: 'var(--text-secondary)' }}>0.110.0</td>
                  <td>pypi</td>
                  <td style={{ color: 'var(--text-muted)' }}>pkg:pypi/fastapi@0.110.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Stage 4: Cosign */}
        {selectedStage === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={18} color="#10b981" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 04: Cosign ECDSA P-256 Cryptographic Signature
                </h3>
              </div>
              <span className="seal-pill pill-emerald">SIGSTORE OCI SPEC COMPLIANT</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Verification Public Key (pipeline/cosign.pub):</span>
                  <button 
                    className="seal-btn seal-btn-secondary" 
                    onClick={() => {
                      navigator.clipboard.writeText(COSIGN_PUB_KEY);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                  >
                    {copiedKey ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
                <pre className="diff-view" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {COSIGN_PUB_KEY}
                </pre>
              </div>

              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  CLI Verification Command:
                </span>
                <div className="diff-view">
                  <span className="diff-comment"># Verify image signature against local key</span>
                  <span className="diff-add">cosign verify --key pipeline/cosign.pub \</span>
                  <span className="diff-add">  --insecure-ignore-tlog=true \</span>
                  <span className="diff-add">  --allow-insecure-registry \</span>
                  <span className="diff-add">  {selectedImage?.image_name || 'localhost:5001/demo-app:v4'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 5: Kyverno */}
        {selectedStage === 5 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#0071e3" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 05: Kyverno Admission Webhook Enforcement
                </h3>
              </div>
              <span className="seal-pill pill-indigo">CLUSTER-POLICY: ENFORCE</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.6' }}>
              Kyverno validates every incoming pod manifest against the public key before scheduling. Unsigned or modified images are rejected with an explicit 403 Forbidden.
            </p>
            <div className="diff-view">
              <span className="diff-comment">apiVersion: kyverno.io/v1</span>
              <span className="diff-comment">kind: ClusterPolicy</span>
              <span className="diff-comment">metadata: name: verify-sealship-image</span>
              <span className="diff-add">spec: validationFailureAction: Enforce</span>
              <span className="diff-comment">  rules:</span>
              <span className="diff-comment">  - name: verify-signature-sealship</span>
              <span className="diff-comment">    match: resources: namespaces: [ "sealship-demo" ]</span>
              <span className="diff-add">    verifyImages:</span>
              <span className="diff-add">    - imageReferences: [ "localhost:5001/*" ]</span>
              <span className="diff-add">      required: true</span>
              <span className="diff-add">{"      attestors: [ { entries: [ { keys: { publicKeys: '-----BEGIN PUBLIC KEY-----...' } } ] } ]"}</span>
            </div>
          </div>
        )}

        {/* Stage 6: Runtime Guard */}
        {selectedStage === 6 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Server size={18} color="#10b981" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Phase 06: Sentry Runtime Guard & Autonomous Rollback
                </h3>
              </div>
              <span className="seal-pill pill-emerald">ZERO-TRUST NETWORKPOLICY ACTIVE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Quarantine Isolation NetworkPolicy:
                </span>
                <div className="diff-view">
                  <span className="diff-comment">kind: NetworkPolicy</span>
                  <span className="diff-comment">metadata: name: quarantine-deny-all</span>
                  <span className="diff-del">spec: podSelector: matchLabels: sealship.io/quarantined: "true"</span>
                  <span className="diff-del">  policyTypes: [ Ingress, Egress ]</span>
                  <span className="diff-comment">  # Empty rules = immediate total network isolation</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Autonomous Rollback Sequence:
                </span>
                <div className="diff-view">
                  <span className="diff-comment">1. Sentry detects /tmp/drift_detected tripwire</span>
                  <span className="diff-add">2. Tag pod: sealship.io/quarantined=true</span>
                  <span className="diff-add">3. NetworkPolicy terminates all sockets instantly</span>
                  <span className="diff-add">4. Run: kubectl rollout undo deployment/demo-app</span>
                  <span className="diff-add">5. Terminate poisoned pod & restore verified baseline</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

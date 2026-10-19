import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Bug, ShieldX, Terminal, Play, CheckCircle2, 
  AlertTriangle, RefreshCw, Server, Flame, Sparkles,
  ShieldAlert, KeyRound, Lock, Radio, Activity, ArrowRight,
  ShieldCheck, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import NetworkTopologyVisual from './NetworkTopologyVisual';

export default function AttackArenaPage({ onRunAttack, attackRunning, terminalOutput }) {
  const [selectedAttack, setSelectedAttack] = useState('unsigned');
  const [lastExecuted, setLastExecuted] = useState(null);

  const attacks = [
    {
      id: 'unsigned',
      num: '01',
      title: 'Run an Unapproved Container',
      subtitle: 'Trying to sneak unverified code past the front door',
      vector: 'An attacker or rogue developer builds a container without your team’s digital seal and tries to deploy it.',
      target: 'Target: sealship-demo / rogue-app:v1',
      mitigation: 'Result: Kyverno admission gate inspects the image, finds no valid seal, and turns it away with a 403 Forbidden.',
      difficulty: 'High Danger',
      icon: ShieldX,
      color: '#e11d48'
    },
    {
      id: 'tamper',
      num: '02',
      title: 'Fake an Approved Container',
      subtitle: 'Subtle supply-chain code tampering',
      vector: 'An attacker modifies the internal software layers while keeping an approved name tag (like demo-app:v4).',
      target: 'Target: sealship-demo / demo-app:v4',
      mitigation: 'Result: Cryptographic checksum validation catches the altered files and blocks deployment immediately.',
      difficulty: 'Critical Danger',
      icon: Bug,
      color: '#d97706'
    },
    {
      id: 'drift',
      num: '03',
      title: 'Hack a Running Container',
      subtitle: 'Live post-deployment tampering',
      vector: 'An attacker opens an unauthorized shell inside a live pod and drops malware (/tmp/drift_detected).',
      target: 'Target: sealship-demo / running pod',
      mitigation: 'Result: Runtime Sentry cuts the pod’s network cable instantly and automatically rolls back to a clean backup.',
      difficulty: 'Live Intrusion',
      icon: Flame,
      color: '#0066cc'
    }
  ];

  const anatomies = {
    unsigned: {
      title: 'Defense Radar: Unsigned Container Interception',
      policy: 'verify-sealship-image (Enforce Mode)',
      decision: 'REJECT_ADMISSION (403 Forbidden)',
      speed: '< 8ms',
      nodes: [
        {
          num: '01',
          title: 'Attacker Deployment',
          desc: 'Rogue pod request kubectl run unsigned-app sent to Kubernetes API.',
          status: 'Infiltration Attempt',
          pillClass: 'pill-rose',
          icon: Zap
        },
        {
          num: '02',
          title: 'Kyverno Admission Hook',
          desc: 'Cluster admission webhook intercepts request before scheduler binds.',
          status: 'Intercepted < 3ms',
          pillClass: 'pill-amber',
          icon: ShieldAlert
        },
        {
          num: '03',
          title: 'Cosign Public Key Query',
          desc: 'Kyverno checks registry for cryptographic signature envelope.',
          status: '0 Valid Signatures',
          pillClass: 'pill-rose',
          icon: KeyRound
        },
        {
          num: '04',
          title: 'Admission Gate Slam',
          desc: 'Request terminated with 403 Forbidden. 0% malware memory allocation.',
          status: 'Threat Neutralized',
          pillClass: 'pill-emerald',
          icon: ShieldCheck
        }
      ]
    },
    tamper: {
      title: 'Defense Radar: Supply Chain Re-Tagging Defeat',
      policy: 'verify-sealship-image (Digest Check)',
      decision: 'SIGNATURE_DIGEST_MISMATCH',
      speed: '< 12ms',
      nodes: [
        {
          num: '01',
          title: 'Tag Hijacking Push',
          desc: 'Attacker overwrites verified tag demo-app:v4 with backdoor payload.',
          status: 'Poisoned Push',
          pillClass: 'pill-rose',
          icon: Bug
        },
        {
          num: '02',
          title: 'Admission Intercept',
          desc: 'Workload rollout submitted to sealship-demo production namespace.',
          status: 'Intercepted < 4ms',
          pillClass: 'pill-amber',
          icon: ShieldAlert
        },
        {
          num: '03',
          title: 'SHA-256 Digest Audit',
          desc: 'Calculated layer digest mismatches cryptographically signed manifest.',
          status: 'Digest Mismatch',
          pillClass: 'pill-rose',
          icon: KeyRound
        },
        {
          num: '04',
          title: 'Integrity Enforcement',
          desc: 'Admission rejected. Cluster runs only unmodified, verified binaries.',
          status: 'Tamper Defeated',
          pillClass: 'pill-emerald',
          icon: ShieldCheck
        }
      ]
    },
    drift: {
      title: 'Defense Radar: Runtime Intrusion & Zero-Trust Auto-Heal',
      policy: 'Runtime Guard & Zero-Trust NetworkPolicy',
      decision: 'ISOLATE & AUTO-ROLLBACK',
      speed: '< 650ms',
      nodes: [
        {
          num: '01',
          title: 'Interactive Shell Breach',
          desc: 'Attacker execs into pod and drops /tmp/drift_detected malware binary.',
          status: 'Intrusion Live',
          pillClass: 'pill-rose',
          icon: Flame
        },
        {
          num: '02',
          title: 'Runtime Sentinel Alarm',
          desc: 'Continuous kernel watcher catches filesystem divergence from baseline.',
          status: 'Drift Detected',
          pillClass: 'pill-amber',
          icon: Radio
        },
        {
          num: '03',
          title: 'Network Sever (Zero-Trust)',
          desc: 'Quarantine NetworkPolicy applied immediately: all ingress/egress severed.',
          status: 'Pod Quarantined',
          pillClass: 'pill-indigo',
          icon: Lock
        },
        {
          num: '04',
          title: 'Instant Auto-Rollback',
          desc: 'Poisoned container evicted; fresh signed replica auto-restored in 1.8s.',
          status: 'Workload Auto-Healed',
          pillClass: 'pill-emerald',
          icon: ShieldCheck
        }
      ]
    }
  };

  const currentAnatomy = anatomies[selectedAttack] || anatomies['unsigned'];

  const handleExecute = async (attackId) => {
    setSelectedAttack(attackId);
    setLastExecuted(attackId);
    await onRunAttack(attackId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#0066cc', '#059669']
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Attack Simulator & Chaos Arena
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Simulate realistic attacks against your local Kubernetes cluster and watch SealShip stop them in real time
          </p>
        </div>
        <span className="seal-pill pill-rose">INTERACTIVE PROVING GROUND</span>
      </div>

      {/* Grid: 3 Attack Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {attacks.map((atk) => {
          const isSelected = selectedAttack === atk.id;
          const isRunning = attackRunning === atk.id;
          return (
            <motion.div
              key={atk.id}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedAttack(atk.id)}
              className="seal-card seal-card-interactive"
              style={{
                padding: '24px',
                borderLeft: isSelected ? `4px solid ${atk.color}` : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(0, 102, 204, 0.04)' : '#ffffff',
                boxShadow: isSelected ? '0 4px 16px rgba(28, 27, 26, 0.08)' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: atk.color, fontWeight: '700' }}>
                  SIMULATION TEST {atk.num}
                </span>
                <span className="seal-pill pill-rose" style={{ fontSize: '10.5px' }}>{atk.difficulty}</span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {atk.title}
              </h3>

              <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: '600', marginBottom: '10px' }}>
                {atk.subtitle}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                {atk.vector}
              </p>

              <div style={{ padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{atk.mitigation}</strong>
              </div>

              <button
                className="seal-btn seal-btn-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute(atk.id);
                }}
                disabled={attackRunning !== null}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Play size={13} />
                <span>{isRunning ? 'Running Simulation...' : 'Launch Test Simulation'}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* REAL-TIME ATTACK DEFENSE RADAR & ANATOMY TIMELINE               */}
      {/* ============================================================== */}
      <div className="radar-wrapper">
        <div className="radar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              background: 'rgba(0, 102, 204, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Activity size={18} color="var(--accent-blue)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {currentAnatomy.title}
                </span>
                <span className="seal-pill pill-indigo" style={{ fontSize: '10px' }}>
                  ACTIVE DEFENSE RADAR
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Enforced by: <strong style={{ color: 'var(--text-primary)' }}>{currentAnatomy.policy}</strong> &bull; Latency: <strong style={{ color: 'var(--accent-blue)' }}>{currentAnatomy.speed}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              VERDICT:
            </span>
            <span className="seal-pill pill-emerald" style={{ fontWeight: '700' }}>
              {currentAnatomy.decision}
            </span>
          </div>
        </div>

        {/* 4-Step Visual Timeline Grid */}
        <div className="radar-timeline-grid">
          {currentAnatomy.nodes.map((node, idx) => {
            const Icon = node.icon;
            const isRunning = attackRunning !== null;
            const isNeutralized = lastExecuted === selectedAttack && !isRunning;

            return (
              <motion.div 
                key={node.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className={`radar-node ${isRunning ? 'running' : ''} ${isNeutralized && idx === 3 ? 'intercepted' : ''}`}
              >
                <div>
                  <div className="radar-node-number">
                    <span>STEP {node.num}</span>
                    <Icon size={14} color={idx === 3 ? '#059669' : idx === 0 ? '#e11d48' : '#0066cc'} />
                  </div>

                  <div className="radar-node-title">
                    {node.title}
                  </div>

                  <div className="radar-node-desc">
                    {node.desc}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <span className={`radar-node-pill ${node.pillClass}`}>
                    <span className="pulsing-dot pulsing-dot-green" style={{ width: '6px', height: '6px' }} />
                    {node.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Zero-Trust Network Topology & Cable-Cut Visualizer */}
      <NetworkTopologyVisual 
        isQuarantined={selectedAttack === 'drift' || lastExecuted === 'drift'} 
        onSimulateDrift={() => handleExecute('drift')} 
      />

      {/* Live macOS Terminal Console */}
      <div className="terminal-window">
        <div className="terminal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="terminal-dots">
              <span className="terminal-dot dot-red" />
              <span className="terminal-dot dot-yellow" />
              <span className="terminal-dot dot-green" />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              LIVE DEFENSE CONSOLE // CLUSTER AUDIT STREAM
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            Connected to: sealship-cluster (local Kind cluster)
          </span>
        </div>

        <div className="terminal-body-view">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {terminalOutput || `[SEALSHIP DEFENSE ENGINE READY]
Choose an attack test above and click 'Launch Test Simulation'.
SealShip will trigger the script against your local cluster, and you will see the exact defense output and block verdict appear here in real time.`}
          </pre>
        </div>
      </div>

    </div>
  );
}

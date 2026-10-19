import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Lock, Server, Activity, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, Zap, Bug, Layers, Eye
} from 'lucide-react';

export default function OverviewPage({ images, selectedImage, setSelectedImage, events, onNavigate }) {
  const score = selectedImage?.trust_score ?? 0;
  const isSigned = Boolean(selectedImage?.is_signed);
  const isBlocked = selectedImage?.status === 'ADMISSION_BLOCKED';
  const isQuarantined = selectedImage?.status === 'QUARANTINED';

  // Speedometer circular gauge
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(score, 0), 100) / 100) * c;
  const gaugeColor = isBlocked || isQuarantined || score < 50 
    ? '#ff3b30' 
    : score >= 70 
      ? '#10b981' 
      : '#ff9500';
  const grade = score >= 85 ? 'A+' : score >= 65 ? 'B' : 'F';

  const avgTrust = Math.round(images.reduce((a, b) => a + (b.trust_score || 0), 0) / (images.length || 1));
  const blockedCount = events.filter(e => e.event_type === 'BLOCKED' || e.event_type === 'DRIFT_DETECTED').length;
  const signedCount = images.filter(i => i.is_signed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ============================================================== */}
      {/* 1. TOP METRICS TILES (4 APPLE CARDS)                           */}
      {/* ============================================================== */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <motion.div whileHover={{ y: -2 }} className="seal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>FLEET TRUST INDEX</span>
            <Activity size={16} color="var(--accent-blue)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {avgTrust}%
            </span>
            <span className="seal-pill pill-emerald" style={{ fontSize: '10.5px' }}>+18% vs baseline</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Weighted provenance index across all images</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="seal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>INTERCEPTED ATTACKS</span>
            <ShieldAlert size={16} color="var(--accent-rose)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent-rose)' }}>
              {blockedCount}
            </span>
            <span className="seal-pill pill-rose" style={{ fontSize: '10.5px' }}>100% BLOCKED</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Kyverno admission & runtime drift blocks</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="seal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>CRYPTOGRAPHIC SEALS</span>
            <Lock size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: '#059669' }}>
              {signedCount}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/ {images.length} workloads</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Cosign ECDSA P-256 signatures</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="seal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>RUNNING POD HEALTH</span>
            <Server size={16} color="var(--accent-blue)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
              1 Ready
            </span>
            <span className="seal-pill pill-indigo" style={{ fontSize: '10.5px' }}>sealship-demo</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Auto-healed and monitored by sentry</p>
        </motion.div>

      </section>

      {/* ============================================================== */}
      {/* 2. ACTIVE WORKLOAD HERO & SPEEDOMETER GAUGE                     */}
      {/* ============================================================== */}
      {selectedImage && (
        <section className="seal-card" style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Left: Metadata */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span className="seal-pill pill-indigo">PRIMARY INSPECTION TARGET</span>
                <span className={`seal-pill ${selectedImage.status === 'ADMISSION_BLOCKED' ? 'pill-rose' : 'pill-emerald'}`}>
                  {selectedImage.status || 'VERIFIED'}
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                  Namespace: <code>sealship-demo</code>
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: '12px' }}>
                {selectedImage.image_name}
              </h2>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Cosign Signature: </span>
                  {isSigned ? (
                    <strong style={{ color: '#059669' }}>✓ Verified (ECDSA P-256)</strong>
                  ) : (
                    <strong style={{ color: '#e11d48' }}>✗ Unsigned (Missing Signature)</strong>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>SBOM Attestation: </span>
                  <strong style={{ color: 'var(--accent-blue)' }}>✓ CycloneDX v1.5 Attached</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                <button 
                  className="seal-btn seal-btn-secondary"
                  onClick={() => onNavigate('pipeline')}
                >
                  <Layers size={14} />
                  <span>Inspect 6-Stage Pipeline</span>
                  <ArrowRight size={13} />
                </button>
                <button 
                  className="seal-btn seal-btn-danger"
                  onClick={() => onNavigate('attacks')}
                >
                  <Zap size={14} />
                  <span>Test Attacks in Chaos Arena</span>
                </button>
              </div>
            </div>

            {/* Right: Circular Speedometer Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="transparent"
                    stroke="rgba(0, 0, 0, 0.05)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="transparent"
                    stroke={gaugeColor}
                    strokeWidth="8"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
                    {score}
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: gaugeColor, marginTop: '3px' }}>
                    GRADE {grade}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
                  <span>Base Score:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
                  <span>CVE Penalty:</span>
                  <strong style={{ color: '#e11d48' }}>-15</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
                  <span>Secret Penalty:</span>
                  <strong style={{ color: '#059669' }}>-0</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
                  <span>Cosign Signature:</span>
                  <strong style={{ color: isSigned ? '#059669' : '#e11d48' }}>{isSigned ? '+10' : '-100'}</strong>
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 3. WORKLOAD QUICK-SWITCHER & ACTIVITY FEED                     */}
      {/* ============================================================== */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Workload Quick Switcher */}
        <div className="seal-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workloads in Registry ({images.length})
            </span>
            <button className="seal-btn seal-btn-secondary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => onNavigate('workloads')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {images.map((img) => {
              const isSelected = selectedImage?.image_name === img.image_name;
              return (
                <div
                  key={img.image_name}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(0, 113, 227, 0.06)' : '#ffffff',
                    border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    boxShadow: isSelected ? '0 2px 8px rgba(0, 113, 227, 0.12)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                      {img.image_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {img.is_signed ? '✓ Signed (ECDSA)' : '✗ Unsigned'}
                    </div>
                  </div>
                  <span className={`seal-pill ${img.trust_score >= 70 ? 'pill-emerald' : img.trust_score >= 50 ? 'pill-amber' : 'pill-rose'}`}>
                    {img.trust_score}/100
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Defense Events */}
        <div className="seal-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Real-Time Security Activity
            </span>
            <button className="seal-btn seal-btn-secondary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => onNavigate('audit')}>
              View Log
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {events.slice(0, 5).map((evt) => (
              <div 
                key={evt.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`seal-pill ${evt.event_type === 'BLOCKED' ? 'pill-rose' : evt.event_type.includes('DRIFT') ? 'pill-amber' : 'pill-emerald'}`} style={{ fontSize: '10px' }}>
                    {evt.event_type}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{evt.message}</span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {evt.timestamp?.split(' ')[1] || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}

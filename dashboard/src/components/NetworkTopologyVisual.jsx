import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Server, ShieldCheck, Flame, Lock, 
  Radio, AlertOctagon, CheckCircle2, ZapOff, Activity
} from 'lucide-react';

export default function NetworkTopologyVisual({ isQuarantined, onSimulateDrift }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Zero-Trust Network Topology & Active Cable-Cut
            </span>
            <span className={`seal-pill ${isQuarantined ? 'pill-rose' : 'pill-emerald'}`} style={{ fontSize: '10px' }}>
              {isQuarantined ? 'NETWORK SEVERED (ZERO-TRUST)' : 'FABRIC INTACT (SECURE)'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Real-time visualization of Kubernetes NetworkPolicy isolation when runtime drift is detected
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            POLICY:
          </span>
          <span className="seal-pill pill-indigo" style={{ fontSize: '10px' }}>
            {isQuarantined ? 'NetworkPolicy: quarantine-deny-all' : 'Default Ingress / Egress'}
          </span>
        </div>
      </div>

      {/* Interactive Topology Canvas */}
      <div style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '30px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(140px, 1fr) 80px minmax(160px, 1fr) 80px minmax(180px, 1.2fr)', 
          alignItems: 'center',
          gap: '10px',
          maxWidth: '880px',
          margin: '0 auto'
        }}>
          
          {/* Node 1: Public Internet / Gateway */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '16px 14px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(0, 102, 204, 0.08)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px'
            }}>
              <Globe size={18} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Public Ingress
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Port 443 / NodePort
            </div>
          </div>

          {/* Wire 1: Public -> Cluster Core (Always Intact) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ 
              width: '100%', height: '3px', 
              background: 'linear-gradient(90deg, #0066cc, #059669)',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <motion.div
                animate={{ x: [-10, 70] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#059669',
                  position: 'absolute', top: '-1.5px'
                }}
              />
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#059669', marginTop: '6px', fontWeight: '700' }}>
              TLS 1.3
            </span>
          </div>

          {/* Node 2: Kubernetes API Core */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '16px 14px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(5, 150, 105, 0.08)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px'
            }}>
              <Server size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Cluster Fabric
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Kind Service Mesh
            </div>
          </div>

          {/* Wire 2: Cluster Core -> Pod (THE CABLE THAT GETS CUT) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {isQuarantined ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                {/* Severed wire with gap */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '6px' }}>
                  <div style={{ width: '35%', height: '3px', background: '#e11d48', borderRadius: '2px' }} />
                  <ZapOff size={16} color="#e11d48" />
                  <div style={{ width: '35%', height: '3px', background: '#e11d48', borderRadius: '2px' }} />
                </div>
                <span style={{ 
                  fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#e11d48', 
                  marginTop: '4px', fontWeight: '800', background: 'rgba(225, 29, 72, 0.1)',
                  padding: '1px 6px', borderRadius: '4px'
                }}>
                  CABLE CUT
                </span>
              </motion.div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', height: '3px', 
                  background: 'linear-gradient(90deg, #059669, #0066cc)',
                  borderRadius: '2px',
                  position: 'relative'
                }}>
                  <motion.div
                    animate={{ x: [-10, 70] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '6px', height: '6px', borderRadius: '50%', background: '#0066cc',
                      position: 'absolute', top: '-1.5px'
                    }}
                  />
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#0066cc', marginTop: '6px', fontWeight: '700' }}>
                  ONLINE
                </span>
              </div>
            )}
          </div>

          {/* Node 3: Target Workload Pod */}
          <motion.div 
            animate={isQuarantined ? {
              boxShadow: ['0 0 0 0 rgba(225, 29, 72, 0.4)', '0 0 0 10px rgba(225, 29, 72, 0)']
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              background: isQuarantined ? 'rgba(225, 29, 72, 0.04)' : '#ffffff',
              border: isQuarantined ? '2px solid #e11d48' : '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '16px 14px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}
          >
            {isQuarantined && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '10px',
                background: '#e11d48',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '9px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={10} /> ZERO-TRUST ISOLATION
              </div>
            )}

            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: isQuarantined ? 'rgba(225, 29, 72, 0.12)' : 'rgba(0, 102, 204, 0.08)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {isQuarantined ? (
                <Flame size={20} color="#e11d48" />
              ) : (
                <ShieldCheck size={20} color="var(--accent-blue)" />
              )}
            </div>

            <div style={{ fontSize: '13px', fontWeight: '700', color: isQuarantined ? '#e11d48' : 'var(--text-primary)' }}>
              {isQuarantined ? 'Rogue Pod (Isolated)' : 'demo-app (Healthy)'}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {isQuarantined ? 'Traffic Dropped (0 KB/s)' : 'localhost:5001/demo-app:v4'}
            </div>
          </motion.div>

        </div>

        {/* Quarantine Context Footer */}
        {isQuarantined && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '20px',
              background: '#ffffff',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={16} color="#e11d48" />
              <span>
                <strong>Zero-Trust Containment Active:</strong> NetworkPolicy dropped all ingress & egress packets. Attacker cannot reach internal databases or exfiltrate credentials.
              </span>
            </div>

            <button
              onClick={onSimulateDrift}
              className="seal-btn seal-btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <Activity size={12} />
              <span>Re-Test Auto-Heal</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

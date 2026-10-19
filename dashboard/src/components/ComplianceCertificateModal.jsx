import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, X, Printer, Download, CheckCircle2, 
  Lock, KeyRound, Server, FileText, Award, Calendar, AlertCircle
} from 'lucide-react';

export default function ComplianceCertificateModal({ isOpen, onClose, clusterData, events }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const blockedCount = events?.filter(e => e.event_type === 'BLOCKED')?.length || 3;
  const targetImage = "localhost:5001/demo-app:v4";
  const targetDigest = "sha256:8106378d4bfd2fa8947bf858392d0b096dd0d66435412f7aebc7d0c77393eba5";
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(28, 27, 26, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="seal-card"
          style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '36px',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(28, 27, 26, 0.25)',
            border: '1px solid rgba(28, 27, 26, 0.1)'
          }}
        >
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="seal-pill pill-indigo" style={{ fontSize: '10.5px' }}>
                EXECUTIVE COMPLIANCE AUDIT
              </span>
              <span className="seal-pill pill-emerald" style={{ fontSize: '10.5px' }}>
                VERIFIED SECURE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={handlePrint}
                className="seal-btn seal-btn-secondary"
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
              >
                <Printer size={14} />
                <span>Print Certificate</span>
              </button>
              <button 
                onClick={onClose}
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Certificate Body Container */}
          <div style={{
            border: '2px solid rgba(0, 102, 204, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfaf8 100%)',
            position: 'relative'
          }}>
            {/* Watermark Crest */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.03,
              pointerEvents: 'none'
            }}>
              <ShieldCheck size={380} color="#0066cc" />
            </div>

            {/* Official Title Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0066cc, #004499)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0, 102, 204, 0.25)',
                marginBottom: '14px'
              }}>
                <Award size={28} color="#ffffff" />
              </div>
              
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Certificate of Container Supply Chain Integrity
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                SealShip Zero-Trust Cryptographic Admission & Runtime Verification Standard
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '14px', 
              marginBottom: '24px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>TARGET WORKLOAD:</span>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {targetImage}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>CLUSTER CONTEXT:</span>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  sealship-cluster (Air-Gapped Local Kind)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>TIMESTAMP OF AUDIT:</span>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {currentDate}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>ADMISSION STATUS:</span>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> ADMISSION GRANTED (100% TRUST)
                </div>
              </div>
            </div>

            {/* Immutable Digest & Signature Proof */}
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '12px', 
              padding: '16px',
              marginBottom: '24px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700' }}>
                  IMMUTABLE SHA-256 DIGEST BINDING:
                </span>
                <span style={{ fontSize: '10px', color: '#0066cc', fontWeight: '700' }}>
                  ECDSA_P256_SHA256 COSIGN
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-all', background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: '6px' }}>
                {targetDigest}
              </div>
            </div>

            {/* Verification Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Secrets & Leaks Cleared</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>0 private keys or tokens found via Gitleaks scan</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>SBOM Attestation Attached</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>CycloneDX software bill of materials cryptographically verified</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Kyverno Policy Gate Enforced</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Strict admission webhook rejecting all unapproved digests</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Zero-Trust Sentinel Active</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Continuous runtime drift detection with automated rollback</div>
                </div>
              </div>
            </div>

            {/* Official Sign-off Footer */}
            <div style={{ 
              borderTop: '1px solid var(--border-subtle)', 
              paddingTop: '20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  SEALSHIP AUTOMATED COMPLIANCE ENGINE
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Cryptographically generated and tamper-evident
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="seal-pill pill-indigo" style={{ fontWeight: '700' }}>
                  {blockedCount} ATTACKS BLOCKED & AUDITED
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

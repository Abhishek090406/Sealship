import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronUp, ChevronDown, Compass, Play, 
  ArrowRight, ShieldCheck, Flame, Award, Eye, EyeOff
} from 'lucide-react';

export default function JudgeGuideFloatingBar({ onNavigate, onTriggerAttack, onOpenCertificate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "The Problem & Pitch",
      time: "30s",
      say: "“Judges, teams scan code in CI, but Kubernetes has zero idea whether running pods were actually approved or tampered with. SealShip solves this with cryptographic zero-trust from code to cluster.”",
      actionLabel: "Show Landing Page",
      action: () => onNavigate('landing')
    },
    {
      step: 2,
      title: "The 6-Gate Supply Chain",
      time: "30s",
      say: "“Before any container enters production, it clears our 6 cryptographic gates: Gitleaks secret scan, Trivy CVE scan, CycloneDX SBOM generation, and Cosign digital seal signing.”",
      actionLabel: "View Supply Chain",
      action: () => onNavigate('pipeline')
    },
    {
      step: 3,
      title: "Front Door Attack Rejection",
      time: "45s",
      say: "“Now let's hack the cluster. When an attacker attempts to run an unapproved container, Kyverno intercepts the request before memory is allocated and turns it away with 403 Forbidden.”",
      actionLabel: "Open Chaos Arena",
      action: () => onNavigate('attacks')
    },
    {
      step: 4,
      title: "Runtime Drift & Quarantine",
      time: "45s",
      say: "“What if an attacker hacks an approved container while running? Our runtime sentry catches unauthorized drift, cuts network cables instantly via zero-trust NetworkPolicy, and auto-rolls back.”",
      actionLabel: "Run Test 3 Simulation",
      action: () => {
        onNavigate('attacks');
        if (onTriggerAttack) onTriggerAttack('drift');
      }
    },
    {
      step: 5,
      title: "Executive Compliance Proof",
      time: "15s",
      say: "“To wrap up, SealShip generates a 1-click executive compliance certificate proving immutable SHA-256 digests, SBOM attestations, and audit logs for CISOs.”",
      actionLabel: "View Certificate",
      action: onOpenCertificate
    }
  ];

  const activeStepData = steps[currentStep - 1];

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      maxWidth: '480px',
      width: 'calc(100vw - 48px)'
    }}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            className="seal-card"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '20px 22px',
              boxShadow: '0 20px 50px rgba(28, 27, 26, 0.16)',
              border: '1px solid rgba(0, 102, 204, 0.25)',
              marginBottom: '10px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="seal-pill pill-indigo" style={{ fontSize: '10px' }}>
                  JUDGE DEMO COPILOT
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Step {currentStep} of {steps.length} &bull; {activeStepData.time}
                </span>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '4px'
                }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Step Title */}
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {activeStepData.title}
            </h4>

            {/* What to Say */}
            <div style={{
              background: 'var(--bg-subtle)',
              borderLeft: '3px solid var(--accent-blue)',
              padding: '10px 12px',
              borderRadius: '0 8px 8px 0',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.45',
              fontStyle: 'italic',
              marginBottom: '16px'
            }}>
              {activeStepData.say}
            </div>

            {/* Navigation & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={activeStepData.action}
                className="seal-btn seal-btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <Play size={12} />
                <span>{activeStepData.actionLabel}</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="seal-btn seal-btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px', opacity: currentStep === 1 ? 0.4 : 1 }}
                >
                  Prev
                </button>
                <button
                  disabled={currentStep === steps.length}
                  onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                  className="seal-btn seal-btn-secondary"
                  style={{ fontSize: '11px', padding: '5px 10px', opacity: currentStep === steps.length ? 0.4 : 1 }}
                >
                  Next Step
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          background: 'linear-gradient(135deg, #1c1b1a, #2f2d2a)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 18px',
          boxShadow: '0 8px 24px rgba(28, 27, 26, 0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '700',
          marginLeft: 'auto'
        }}
      >
        <Sparkles size={15} color="#ffd700" />
        <span>{isExpanded ? 'Hide Presenter Guide' : 'Judge Demo Guide (Pitch Mode)'}</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </motion.button>
    </div>
  );
}

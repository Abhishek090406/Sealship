import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, FileCode, Copy, Check, ShieldAlert, Sparkles, AlertTriangle, Bug
} from 'lucide-react';

export default function AISecOpsPage({ selectedImage, explanation }) {
  const [copied, setCopied] = useState(false);

  const copyDiff = () => {
    if (explanation?.diff_patch) {
      navigator.clipboard.writeText(explanation.diff_patch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-blue)" />
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
              AI Threat Intelligence & Autonomous Remediation Studio
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Synthesizing real-world attack vectors and generating automated patches for <strong style={{ color: 'var(--text-primary)' }}>{selectedImage?.image_name || 'Container Workload'}</strong>
          </p>
        </div>
        <span className="seal-pill pill-indigo">
          {explanation?.generated_by || 'Gemini 1.5 Pro / SecOps'}
        </span>
      </div>

      {/* Executive Security Briefing Card */}
      <div className="seal-card" style={{ padding: '28px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Executive Security Briefing
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {explanation?.executive_summary || 'Evaluating workload configuration and dependency graph for exploitable vulnerabilities...'}
        </p>
      </div>

      {/* Ranked Threat Vectors */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
          Top Exploitable Attack Vectors (Ranked by Severity)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {explanation?.top_risks?.map((risk) => (
            <div 
              key={risk.cve}
              className="seal-card"
              style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#e11d48', fontFamily: 'var(--font-mono)' }}>
                    {risk.cve}
                  </span>
                  <span className="seal-pill pill-amber">{risk.package}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  {risk.summary}
                </p>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Exploitation Scenario: </strong>
                {risk.exploitation_vector}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Dockerfile Patch Diff */}
      {explanation?.diff_patch && (
        <div className="seal-card" style={{ padding: '28px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={16} color="#059669" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Automated Dockerfile Hardening Diff
              </h3>
            </div>

            <button 
              className="seal-btn seal-btn-secondary"
              onClick={copyDiff}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Patch'}</span>
            </button>
          </div>

          <div className="diff-view">
            {explanation.diff_patch.split('\n').map((line, idx) => {
              let className = 'diff-comment';
              if (line.startsWith('+')) className = 'diff-add';
              else if (line.startsWith('-')) className = 'diff-del';
              return <span key={idx} className={className}>{line}</span>;
            })}
          </div>
        </div>
      )}

    </div>
  );
}

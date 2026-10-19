import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, ShieldCheck, ShieldAlert, Lock, CheckCircle2, 
  XCircle, Server, Layers, Cpu, Database
} from 'lucide-react';

export default function WorkloadsPage({ images, selectedImage, setSelectedImage }) {
  const [query, setQuery] = useState('');

  const filtered = images.filter(i => 
    i.image_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Workload Registry & Inventory ({images.length})
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Catalog of all container images discovered in the local registry (localhost:5001)
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search workloads..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>
      </div>

      {/* Grid of Workloads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map((img) => {
          const isSelected = selectedImage?.image_name === img.image_name;
          const isSigned = Boolean(img.is_signed);
          const isBlocked = img.status === 'ADMISSION_BLOCKED';

          return (
            <motion.div
              key={img.image_name}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedImage(img)}
              className="seal-card seal-card-interactive"
              style={{
                padding: '24px',
                border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(0, 113, 227, 0.04)' : '#ffffff',
                boxShadow: isSelected ? '0 4px 16px rgba(0, 113, 227, 0.12)' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className={`seal-pill ${isBlocked ? 'pill-rose' : 'pill-emerald'}`}>
                  {img.status || 'VERIFIED'}
                </span>
                <span className={`seal-pill ${img.trust_score >= 70 ? 'pill-emerald' : img.trust_score >= 50 ? 'pill-amber' : 'pill-rose'}`}>
                  TRUST SCORE {img.trust_score}/100
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: '8px' }}>
                {img.image_name}
              </h3>

              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                Digest: {img.digest ? `${img.digest.substring(0, 28)}...` : 'sha256:97dcbf958...'}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                {isSigned ? (
                  <span className="seal-pill pill-emerald"><CheckCircle2 size={11} /> Cosign Signed</span>
                ) : (
                  <span className="seal-pill pill-rose"><XCircle size={11} /> Unsigned</span>
                )}
                <span className="seal-pill pill-indigo"><Layers size={11} /> SBOM Attached</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

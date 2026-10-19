import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, ShieldCheck, ShieldAlert, Zap, AlertTriangle, 
  RefreshCw, Download, Search, CheckCircle2
} from 'lucide-react';

export default function AuditLogsPage({ events, onRefresh }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = events.filter(e => {
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'BLOCKED' && e.event_type === 'BLOCKED') ||
      (filter === 'DRIFT' && (e.event_type.includes('DRIFT') || e.event_type === 'QUARANTINED')) ||
      (filter === 'SIGNED' && (e.event_type === 'SIGNED' || e.event_type === 'ADMITTED'));

    const matchesSearch = 
      e.message.toLowerCase().includes(search.toLowerCase()) ||
      e.image.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "sealship_audit_events.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Cluster Admission & Runtime Audit Log ({events.length})
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Cryptographically sealed event ledger capturing Kyverno webhook decisions and drift sentry triggers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="seal-btn seal-btn-secondary" onClick={exportJSON}>
            <Download size={13} />
            <span>Export JSON</span>
          </button>
          <button className="seal-btn seal-btn-secondary" onClick={onRefresh}>
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'BLOCKED', 'DRIFT', 'SIGNED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`seal-btn ${filter === f ? 'seal-btn-primary' : 'seal-btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '12.5px' }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={13} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 34px',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Events Feed */}
      <div className="seal-card" style={{ padding: '20px', background: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflowY: 'auto' }}>
          {filtered.map((evt) => {
            let pillClass = 'pill-indigo';
            if (evt.event_type === 'BLOCKED') pillClass = 'pill-rose';
            else if (evt.event_type.includes('DRIFT')) pillClass = 'pill-amber';
            else if (evt.event_type === 'QUARANTINED') pillClass = 'pill-rose';
            else if (evt.event_type === 'SIGNED' || evt.event_type === 'ADMITTED') pillClass = 'pill-emerald';

            return (
              <div 
                key={evt.id}
                style={{ 
                  padding: '14px 18px', borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`seal-pill ${pillClass}`}>{evt.event_type}</span>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{evt.message}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      Target: {evt.image}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {evt.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

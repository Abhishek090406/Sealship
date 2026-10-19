import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, RefreshCw, Zap, Award
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import OverviewPage from './components/OverviewPage';
import PipelinePage from './components/PipelinePage';
import WorkloadsPage from './components/WorkloadsPage';
import AttackArenaPage from './components/AttackArenaPage';
import AISecOpsPage from './components/AISecOpsPage';
import AuditLogsPage from './components/AuditLogsPage';
import ComplianceCertificateModal from './components/ComplianceCertificateModal';
import JudgeGuideFloatingBar from './components/JudgeGuideFloatingBar';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'overview' | 'pipeline' | 'workloads' | 'attacks' | 'ai' | 'audit'
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attack Execution state
  const [attackRunning, setAttackRunning] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [certModalOpen, setCertModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [imgRes, evtRes] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/events?limit=100')
      ]);
      const imgData = await imgRes.json();
      const evtData = await evtRes.json();

      const imgs = imgData.images || [];
      setImages(imgs);
      setEvents(evtData.events || []);

      if (imgs.length > 0 && !selectedImage) {
        const signedFirst = imgs.find(i => i.is_signed) || imgs[0];
        setSelectedImage(signedFirst);
      } else if (selectedImage) {
        const updated = imgs.find(i => i.image_name === selectedImage.image_name);
        if (updated) setSelectedImage(updated);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);
  }, [selectedImage?.image_name]);

  useEffect(() => {
    if (selectedImage) {
      fetch(`/api/explain/${encodeURIComponent(selectedImage.image_name)}`)
        .then(res => res.json())
        .then(data => setExplanation(data))
        .catch(err => console.error('Explain fetch error:', err));
    }
  }, [selectedImage?.image_name, selectedImage?.updated_at]);

  const handleRunAttack = async (type) => {
    setAttackRunning(type);
    setTerminalOutput(`[RED TEAM CHAOS ENGINE TRIGGERED]...\nTargeting cluster: sealship-cluster (Kind local context)\nExecuting script: attack/attack_${type}.sh...\n`);
    
    // Switch to attacks arena if on a different page
    if (currentPage !== 'attacks' && currentPage !== 'landing') {
      setCurrentPage('attacks');
    }

    try {
      const res = await fetch('/api/attack/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: type })
      });
      const cleanAnsi = (str) => typeof str === 'string' ? str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') : str;

      if (data.stdout) {
        setTerminalOutput(prev => prev + '\n' + cleanAnsi(data.stdout));
      }
      if (data.stderr) {
        setTerminalOutput(prev => prev + '\n[STDERR]\n' + cleanAnsi(data.stderr));
      }

      await fetchData();
    } catch (err) {
      setTerminalOutput(prev => prev + `\n[ERROR]: ${err.message}`);
    } finally {
      setAttackRunning(null);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'overview', label: 'Cockpit' },
    { id: 'pipeline', label: 'Supply Chain' },
    { id: 'workloads', label: 'Workloads' },
    { id: 'attacks', label: 'Chaos Arena' },
    { id: 'ai', label: 'AI SecOps' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '16px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* ============================================================== */}
      {/* 1. APPLE FLOATING FROSTED GLASS HEADER                         */}
      {/* ============================================================== */}
      <header className="apple-nav-bar">
        
        {/* Brand identity */}
        <div 
          onClick={() => setCurrentPage('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, #0071e3, #42a5f5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 113, 227, 0.25)'
          }}>
            <ShieldCheck size={18} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                SealShip
              </span>
              <span className="seal-pill pill-indigo" style={{ fontSize: '9.5px', padding: '2px 8px' }}>
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-pill-group">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`nav-pill-item ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Telemetry Status Beacons & Sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulsing-dot pulsing-dot-green" />
              <span>kind: <strong style={{ color: 'var(--text-primary)' }}>online</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulsing-dot pulsing-dot-green" />
              <span>Kyverno: <strong style={{ color: '#059669' }}>enforcing</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulsing-dot pulsing-dot-green" />
              <span>Sentry: <strong style={{ color: '#0071e3' }}>watching</strong></span>
            </div>
          </div>

          <button 
            className="seal-btn seal-btn-secondary" 
            onClick={() => setCertModalOpen(true)}
            title="Executive Security Certificate"
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600' }}
          >
            <Award size={14} color="var(--accent-blue)" />
            <span>Audit Certificate</span>
          </button>

          <button 
            className="seal-btn seal-btn-secondary" 
            onClick={fetchData} 
            title="Sync Telemetry"
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-full)' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>

      </header>

      {/* ============================================================== */}
      {/* 2. DYNAMIC PAGE ROUTER                                         */}
      {/* ============================================================== */}
      <AnimatePresence mode="wait">
        
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <LandingPage 
              onEnterCockpit={() => setCurrentPage('overview')} 
              onRunAttack={handleRunAttack}
              attackRunning={attackRunning}
            />
          </motion.div>
        )}

        {currentPage === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <OverviewPage 
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              events={events}
              onNavigate={(page) => setCurrentPage(page)}
            />
          </motion.div>
        )}

        {currentPage === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <PipelinePage 
              selectedImage={selectedImage}
            />
          </motion.div>
        )}

        {currentPage === 'workloads' && (
          <motion.div
            key="workloads"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <WorkloadsPage 
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
          </motion.div>
        )}

        {currentPage === 'attacks' && (
          <motion.div
            key="attacks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AttackArenaPage 
              onRunAttack={handleRunAttack}
              attackRunning={attackRunning}
              terminalOutput={terminalOutput}
            />
          </motion.div>
        )}

        {currentPage === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AISecOpsPage 
              selectedImage={selectedImage}
              explanation={explanation}
            />
          </motion.div>
        )}

        {currentPage === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AuditLogsPage 
              events={events}
              onRefresh={fetchData}
            />
          </motion.div>
        )}

      </AnimatePresence>
      
      {/* 3. EXECUTIVE COMPLIANCE AUDIT CERTIFICATE MODAL */}
      <ComplianceCertificateModal 
        isOpen={certModalOpen} 
        onClose={() => setCertModalOpen(false)} 
        clusterData={images} 
        events={events} 
      />

      {/* 4. JUDGE DEMO COPILOT FLOATING BAR */}
      <JudgeGuideFloatingBar 
        onNavigate={setCurrentPage} 
        onTriggerAttack={handleRunAttack} 
        onOpenCertificate={() => setCertModalOpen(true)} 
      />

    </div>
  );
}

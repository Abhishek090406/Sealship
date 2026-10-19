import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Lock, Zap, Server, Cpu, Eye, 
  ArrowRight, CheckCircle2, Terminal, Play, Check, Sparkles,
  Layers, ChevronRight, Activity, Flame, ShieldX, Key, RefreshCw,
  Stamp, UserCheck, HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Word-by-word scroll reveal helper
function AnimatedWord({ text, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const color = useTransform(progress, range, ['#aba79d', '#1c1b1a']);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span 
      style={{ 
        opacity, 
        color, 
        y, 
        display: 'inline-block', 
        marginRight: '0.26em',
        fontWeight: '700'
      }}
    >
      {text}
    </motion.span>
  );
}

// Apple Pinned Sticky Narrative (Ultra-Simple Analogy)
function SimpleStickyNarrative() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const statement1 = "You wouldn't let a stranger enter your home without an ID.".split(" ");
  const statement2 = "Yet cloud servers run software every day without checking who built it or whether it was secretly altered.".split(" ");
  const statement3 = "SealShip stamps approved software with an unbreakable digital seal. If it isn't sealed, it simply cannot run.".split(" ");

  const p1Active = useTransform(scrollYProgress, [0, 0.35], [0.4, 1]);
  const p2Active = useTransform(scrollYProgress, [0.35, 0.7], [0.4, 1]);
  const p3Active = useTransform(scrollYProgress, [0.7, 1.0], [0.4, 1]);

  return (
    <div ref={containerRef} className="apple-sticky-wrapper">
      <div className="apple-sticky-content">
        
        {/* Simple Progress Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <motion.div style={{ opacity: p1Active }} className="seal-pill pill-indigo">
            THE REAL PROBLEM
          </motion.div>
          <motion.div style={{ opacity: p2Active }} className="seal-pill pill-indigo">
            HOW HACKS HAPPEN
          </motion.div>
          <motion.div style={{ opacity: p3Active }} className="seal-pill pill-emerald">
            HOW SEALSHIP SOLVES IT
          </motion.div>
        </div>

        {/* Sentence 1 */}
        <div style={{ fontSize: '38px', lineHeight: '1.25', letterSpacing: '-0.025em', marginBottom: '28px' }}>
          {statement1.map((word, i) => {
            const start = 0.05 + (i / statement1.length) * 0.28;
            const end = start + 0.06;
            return <AnimatedWord key={`s1-${i}`} text={word} progress={scrollYProgress} range={[start, end]} />;
          })}
        </div>

        {/* Sentence 2 */}
        <div style={{ fontSize: '30px', lineHeight: '1.38', letterSpacing: '-0.02em', marginBottom: '28px' }}>
          {statement2.map((word, i) => {
            const start = 0.35 + (i / statement2.length) * 0.32;
            const end = start + 0.06;
            return <AnimatedWord key={`s2-${i}`} text={word} progress={scrollYProgress} range={[start, end]} />;
          })}
        </div>

        {/* Sentence 3 */}
        <div style={{ fontSize: '30px', lineHeight: '1.38', letterSpacing: '-0.02em' }}>
          {statement3.map((word, i) => {
            const start = 0.70 + (i / statement3.length) * 0.24;
            const end = Math.min(start + 0.06, 0.99);
            return <AnimatedWord key={`s3-${i}`} text={word} progress={scrollYProgress} range={[start, end]} />;
          })}
        </div>

        {/* Scroll Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '40px', fontSize: '12.5px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
          <span>Scroll to continue story</span>
          <ArrowRight size={13} style={{ transform: 'rotate(90deg)' }} />
        </div>

      </div>
    </div>
  );
}

export default function LandingPage({ onEnterCockpit, onRunAttack, attackRunning }) {
  const triggerLandingDemo = async (type) => {
    await onRunAttack(type);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0066cc', '#059669', '#7c3aed']
    });
  };

  const heroWords = "Only approved code runs in your cloud. Nothing else.".split(" ");

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '120px' }}>
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION (SIMPLE & INTUITIVE)                           */}
      {/* ============================================================== */}
      <section style={{ textAlign: 'center', padding: '60px 20px 40px 20px', position: 'relative' }}>
        
        {/* Simple Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '6px 18px', borderRadius: 'var(--radius-full)', 
            background: 'rgba(0, 102, 204, 0.06)', border: '1px solid rgba(0, 102, 204, 0.16)',
            marginBottom: '28px', boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span className="pulsing-dot pulsing-dot-green" />
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--accent-blue)', letterSpacing: '0.02em' }}>
            Automatic Security Guard for Kubernetes
          </span>
          <span style={{ fontSize: '11px', background: '#ffffff', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '600', boxShadow: '0 1px 4px rgba(28,27,26,0.06)' }}>
            v1.4.2
          </span>
        </motion.div>

        {/* Animated Headline */}
        <h1 
          className="apple-gradient-text"
          style={{ 
            fontSize: '60px', fontWeight: '800', letterSpacing: '-0.035em', 
            lineHeight: '1.1', maxWidth: '960px', margin: '0 auto 24px auto' 
          }}
        >
          {heroWords.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.07 * index, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{ 
                display: 'inline-block', 
                marginRight: '0.24em',
                color: index >= 5 ? 'var(--accent-blue)' : undefined
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Simple Plain-English Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            fontSize: '19px', color: 'var(--text-secondary)', maxWidth: '700px', 
            margin: '0 auto 40px auto', lineHeight: '1.6', letterSpacing: '-0.01em' 
          }}
        >
          SealShip puts an unbreakable digital seal on your container images when they are built. If a hacker or rogue script tries to deploy unapproved code, Kubernetes blocks it instantly.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}
        >
          <button 
            className="seal-btn seal-btn-primary" 
            onClick={onEnterCockpit}
            style={{ padding: '12px 30px', fontSize: '14.5px' }}
          >
            <span>Open Security Dashboard</span>
            <ArrowRight size={16} />
          </button>

          <button 
            className="seal-btn seal-btn-secondary" 
            onClick={() => triggerLandingDemo('unsigned')}
            disabled={attackRunning !== null}
            style={{ padding: '12px 24px', fontSize: '14.5px' }}
          >
            <Zap size={15} color="var(--accent-blue)" />
            <span>Try Blocking an Unsigned App</span>
          </button>
        </motion.div>

        {/* ============================================================ */}
        {/* HOW IT WORKS IN 3 SIMPLE STEPS                               */}
        {/* ============================================================ */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="seal-card"
          style={{ 
            maxWidth: '1120px', margin: '0 auto', padding: '36px', textAlign: 'left',
            boxShadow: 'var(--shadow-float)', background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="seal-pill pill-indigo" style={{ marginBottom: '8px' }}>
                HOW IT WORKS IN 3 SIMPLE STEPS
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                From Your Laptop to the Cloud
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span className="pulsing-dot pulsing-dot-green" />
              <span>Kubernetes Security Gate: <strong style={{ color: 'var(--text-primary)' }}>Active</strong></span>
            </div>
          </div>

          {/* 3 Clear Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 102, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Eye size={20} color="#0066cc" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>Step 1</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Scan for Flaws</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Automatically checks code for leaked passwords and vulnerable packages before anything is built.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Stamp size={20} color="#059669" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', marginBottom: '4px' }}>Step 2</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Attach Digital Seal</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Signs approved containers with a cryptographic key. It acts like a tamper-evident wax seal that cannot be forged.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="#e11d48" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#e11d48', textTransform: 'uppercase', marginBottom: '4px' }}>Step 3</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Block Unsealed Code</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Kubernetes checks the seal at the front door. If unsealed code tries to run, it gets rejected on the spot.
              </p>
            </div>

          </div>
        </motion.div>

      </section>

      {/* ============================================================== */}
      {/* 2. APPLE PINNED STICKY STORY (PLAIN-ENGLISH)                   */}
      {/* ============================================================== */}
      <SimpleStickyNarrative />

      {/* ============================================================== */}
      {/* 3. THREE CORE DEFENSES (BENEFIT-FOCUSED)                       */}
      {/* ============================================================== */}
      <section style={{ padding: '40px 20px', maxWidth: '1160px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <span className="seal-pill pill-indigo" style={{ marginBottom: '12px' }}>COMPLETE PROTECTION</span>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '12px' }}>
            How SealShip Protects You
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            No complicated configuration. Three automatic layers of protection.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <motion.div 
            whileHover={{ y: -4 }} 
            className="seal-card seal-card-interactive" 
            style={{ padding: '32px', background: '#ffffff' }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(0, 102, 204, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Lock size={22} color="#0066cc" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              1. Digital Passport (Cosign)
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Every approved software build gets an unforgeable digital passport. You know with 100% certainty that what's running in production is exactly what your team approved.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }} 
            className="seal-card seal-card-interactive" 
            style={{ padding: '32px', background: '#ffffff' }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck size={22} color="#059669" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              2. Bouncer at the Gate (Kyverno)
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Like an airport security gate: unverified code, fake images, or tampered containers are turned away before they ever get a chance to start up.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }} 
            className="seal-card seal-card-interactive" 
            style={{ padding: '32px', background: '#ffffff' }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(225, 29, 72, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Flame size={22} color="#e11d48" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              3. Self-Healing Shield (Drift Guard)
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              If a hacker somehow breaks into a running container, the guard instantly cuts its network cable and automatically rolls back to a healthy, clean backup.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. CALLOUT BANNER                                              */}
      {/* ============================================================== */}
      <section style={{ padding: '20px', maxWidth: '1160px', margin: '0 auto' }}>
        <div 
          className="seal-card"
          style={{ 
            padding: '44px', 
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div>
            <span className="seal-pill pill-indigo" style={{ marginBottom: '12px' }}>READY TO EXPLORE</span>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              See SealShip defend your cluster live.
            </h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
              Check your security scores, inspect verified container seals, or simulate an attack in the Chaos Arena to watch the defense in action.
            </p>
          </div>

          <button 
            className="seal-btn seal-btn-primary" 
            onClick={onEnterCockpit}
            style={{ padding: '14px 30px', fontSize: '14.5px' }}
          >
            <span>Launch Security Cockpit</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

    </div>
  );
}

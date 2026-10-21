import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Sparkles,
  FolderTree,
  ShieldCheck,
  WifiOff,
  Award,
  Zap,
  ArrowRight,
  Smartphone,
  BookOpen,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { HeroTerminalSimulator } from './components/HeroTerminalSimulator';
import { InteractiveFeatureTour } from './components/InteractiveFeatureTour';
import { APP_CONFIG } from '../../app/config/app-config';

/**
 * Animated number counter that ticks up smoothly when scrolled into view
 */
const AnimatedStatNumber: React.FC<{ target: number; suffix?: string; isVisible: boolean }> = ({
  target,
  suffix = '',
  isVisible,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [isVisible, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export const ShowcaseLandingView: React.FC = () => {
  const { setCurrentView, selectLab, completedLabIds, registry } = useAppStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

  const totalLabs = registry.listLabs('linux-foundations').length || 20;
  const completedCount = completedLabIds.size;
  const hasProgress = completedCount > 0;

  const handleStartTraining = () => {
    selectLab('001-where-am-i', 'linux-foundations');
  };

  const handleOpenPlayground = () => {
    setCurrentView('playground');
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleOpenCatalog = () => {
    setCurrentView('catalog');
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Track scroll position for top glowing progress bar
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const totalScroll = scrollHeight - clientHeight;
    if (totalScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / totalScroll) * 100)));
    }
  };

  // Interactive mouse spotlight tracking for glassmorphic cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // Setup intersection observer for scroll-triggered reveal animations
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target.getAttribute('data-stats-strip') === 'true') {
              setStatsVisible(true);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = container.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="showcase-scroll-container"
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#080b10',
        color: 'var(--color-text-primary)',
        position: 'relative',
      }}
    >
      {/* Top Glowing Scroll Progress Bar */}
      <div
        className="showcase-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Background Matrix Cyber Grid */}
      <div className="cyber-grid-canvas" />

      {/* Background Cyber Ambient Floating Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '20%',
          width: '650px',
          height: '650px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(129, 140, 248, 0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'floatOrb1 16s ease-in-out infinite alternate',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '900px',
          right: '5%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.04) 45%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'floatOrb2 20s ease-in-out infinite alternate',
        }}
      />

      {/* Main Container */}
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '40px 24px 80px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '64px',
        }}
      >
        {/* ================= HERO SECTION ================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
            paddingTop: '16px',
          }}
        >
          {/* Top Glowing Pill Badge */}
          <div className="showcase-badge-pill" style={{ animation: 'cyberFloat 6s ease-in-out infinite' }}>
            <Sparkles size={14} color="#38bdf8" />
            <span>Next-Gen Linux Academy • Native WASIX WebAssembly</span>
          </div>

          {/* Main Billboard Headline */}
          <h1
            className="showcase-gradient-text"
            style={{
              fontSize: 'clamp(32px, 5.2vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1.2px',
              maxWidth: '880px',
              margin: 0,
            }}
          >
            Master the Linux Terminal.
            <br />
            Directly in Your Browser.
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            No servers. No cloud subscriptions. Zero network leaks. Experience a native
            client-side Linux sandbox with 20 hands-on guided labs, real-time spatial filesystem diffing,
            and instant automated validation.
          </p>

          {/* Active Verified Progress Badge */}
          {hasProgress && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(63, 185, 80, 0.12)',
                border: '1px solid rgba(63, 185, 80, 0.3)',
                color: 'var(--color-success)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} />
              <span>{completedCount} of {totalLabs} labs verified</span>
            </div>
          )}

          {/* High-Impact CTA Button Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}
          >
            <button
              className="showcase-hero-cta"
              onClick={handleStartTraining}
              aria-label={hasProgress ? 'Resume Training' : 'Start Training Sandbox'}
            >
              <Zap size={18} />
              <span>{hasProgress ? 'Resume Training' : 'Start Training Sandbox'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="showcase-secondary-cta"
              onClick={handleOpenPlayground}
              aria-label="Open Freeform Playground"
            >
              <Play size={16} color="var(--color-accent)" />
              <span>Open Freeform Playground</span>
            </button>

            <button
              className="showcase-secondary-cta"
              onClick={handleOpenDashboard}
              aria-label="View Readiness Dashboard"
            >
              <BarChart3 size={16} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Key Assurance Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: '4px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="var(--color-success)" />
              <span>100% Client-Side WASM</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <WifiOff size={15} color="var(--color-warning)" />
              <span>Zero Network Egress</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="var(--color-accent)" />
              <span>&lt;50ms Instant Spinup</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={15} color="#c084fc" />
              <span>Mobile Touch Bar Ready</span>
            </span>
          </div>

          {/* Live Interactive Hero Terminal Simulator */}
          <div style={{ width: '100%', marginTop: '16px' }}>
            <HeroTerminalSimulator />
          </div>

          {/* Animated Scroll Down Indicator */}
          <button
            onClick={scrollToFeatures}
            className="scroll-down-hint"
            aria-label="Scroll down to explore interactive features"
          >
            <span>Scroll to explore interactive capabilities</span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* ================= STATS / PILLARS STRIP ================= */}
        <div
          data-stats-strip="true"
          className="reveal-on-scroll interactive-spotlight-card"
          onMouseMove={handleCardMouseMove}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            padding: '28px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              <AnimatedStatNumber target={20} isVisible={statsVisible} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Hands-On Guided Labs
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
              <AnimatedStatNumber target={100} suffix="%" isVisible={statsVisible} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Client-Side WebAssembly
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
              0 KB
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Server Data Egress
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              Local-First
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Dexie IndexedDB Engine
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE BENTO DEMO TOUR ================= */}
        <div ref={featuresRef} className="reveal-on-scroll">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Interactive Feature Playground
            </span>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-text-heading)',
                marginTop: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              Test-Drive ShellGround Capabilities
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
              Experience the core innovations that make ShellGround the most intuitive browser terminal trainer.
            </p>
          </div>

          <InteractiveFeatureTour />
        </div>

        {/* ================= CORE FEATURES GRID ================= */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-success)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Engineered for Command Line Fluency
            </span>
            <h2
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-text-heading)',
                marginTop: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              Everything You Need to Master Linux
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
              Built specifically to bridge the cognitive gap between typing commands in the dark and seeing what actually happens.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Feature 1: Spatial Filesystem Tree */}
            <div
              className="reveal-on-scroll reveal-delay-100 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <FolderTree size={22} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                Live Spatial Filesystem Tree
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Never wonder where your file went. Watch directories expand and files glow with green
                <strong style={{ color: 'var(--color-success)' }}> +NEW </strong> and amber
                <strong style={{ color: 'var(--color-warning)' }}> ~MOD </strong> badges the millisecond you run <code>touch</code>, <code>mkdir</code>, or <code>rm</code>.
              </p>
            </div>

            {/* Feature 2: Native WASIX POSIX Runtime */}
            <div
              className="reveal-on-scroll reveal-delay-200 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Cpu size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                Native WASIX Virtual Kernel
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                True POSIX system calls compiled to WebAssembly. Full support for pipelines (<code>|</code>),
                standard error redirection (<code>2&gt;</code>), exit codes, virtual memory, and process sandboxing.
              </p>
            </div>

            {/* Feature 3: Automated Outcome Validation */}
            <div
              className="reveal-on-scroll reveal-delay-300 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(192, 132, 252, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <CheckCircle2 size={22} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                Instant Automated Validation
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Press <code>Ctrl+Enter</code> or click Validate to trigger rigorous multi-rule checking.
                Verifies file existence, SHA256 hashes, regex contents, directory structures, and process exit codes.
              </p>
            </div>

            {/* Feature 4: Spaced-Repetition Concept Mastery */}
            <div
              className="reveal-on-scroll reveal-delay-100 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Award size={22} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                Spaced-Repetition Skill Analytics
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Tracks retention using an algorithmic half-life decay model across 8 core Linux competencies.
                Interactive radar charts identify knowledge gaps and recommend practice drills.
              </p>
            </div>

            {/* Feature 5: Mobile Command Cockpit */}
            <div
              className="reveal-on-scroll reveal-delay-200 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Smartphone size={22} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                Mobile Touch Command Bar
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Practice on the subway or couch. Dedicated on-screen accessory touchbar provides hardware
                keys missing from mobile keyboards (<code>Tab</code>, <code>Ctrl+C</code>, <code>|</code>, <code>/</code>, <code>~</code>, <code>&gt;</code>).
              </p>
            </div>

            {/* Feature 6: Air-Gapped Local-First Privacy */}
            <div
              className="reveal-on-scroll reveal-delay-300 interactive-spotlight-card"
              onMouseMove={handleCardMouseMove}
              style={{ padding: '26px' }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Lock size={22} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-heading)', margin: '0 0 8px' }}>
                100% Air-Gapped Local-First
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Zero telemetry leaves your machine. All progress, lab attempts, and command history
                are securely stored in browser IndexedDB (Dexie). Works offline without internet connectivity.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3-STEP LEARNING JOURNEY ================= */}
        <div
          className="reveal-on-scroll interactive-spotlight-card"
          onMouseMove={handleCardMouseMove}
          style={{
            padding: '40px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', marginTop: '6px' }}>
              Your 3-Step Journey to Linux Mastery
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                PHASE 01
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-heading)', margin: 0 }}>
                Select a Real-World Mission
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Pick from 20 progressive scenarios in the Linux Foundations track, ranging from navigation fundamentals to log forensics.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                PHASE 02
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-heading)', margin: 0 }}>
                Execute in the Isolated Sandbox
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Type commands in an authentic xterm.js terminal with live filesystem tree feedback, progressive hints, and clean sandbox reset.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                PHASE 03
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-heading)', margin: 0 }}>
                Automated Grading & Mastery Tracking
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Pass automated outcome validation checks and review your concept mastery scores with retention decay analytics.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FINAL CALL TO ACTION ================= */}
        <div
          className="reveal-on-scroll interactive-spotlight-card"
          onMouseMove={handleCardMouseMove}
          style={{
            position: 'relative',
            padding: '52px 32px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(192, 132, 252, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(56, 189, 248, 0.06)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div className="showcase-badge-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
            <span>Ready to Command?</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Your Browser is Your Command Cockpit.
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Jump straight into Lab 001: Where Am I? and experience the speed of client-side WebAssembly terminal training.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <button
              className="showcase-hero-cta"
              onClick={handleStartTraining}
            >
              <Zap size={18} />
              <span>Start Lab 001 Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="showcase-secondary-cta"
              onClick={handleOpenCatalog}
            >
              <BookOpen size={16} />
              <span>Browse All 20 Labs</span>
            </button>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '32px',
            borderTop: '1px solid var(--color-border-default)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span>&gt;_ {APP_CONFIG.appName} v{APP_CONFIG.appVersion} • MIT Licensed</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleOpenDashboard}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              Dashboard
            </button>
            <button
              onClick={handleOpenCatalog}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              Curriculum
            </button>
            <button
              onClick={handleOpenPlayground}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              Playground
            </button>
            <a
              href={APP_CONFIG.docsUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>GitHub</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

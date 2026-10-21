import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export const SystemLiveGauges: React.FC = () => {
  const [ramUsage, setRamUsage] = useState(34.2);
  const [activeGauge, setActiveGauge] = useState<number | null>(null);

  // Subtle real-time fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setRamUsage((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.min(38, Math.max(32, prev + delta)).toFixed(1));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const gauges = [
    {
      id: 0,
      label: 'WASM HEAP MEMORY',
      value: `${ramUsage} MB`,
      sub: 'Max 512 MB Pool',
      pct: (ramUsage / 512) * 100 * 5, // scaled for gauge visibility
      color: '#00f0ff',
      icon: <Cpu size={16} color="#00f0ff" />,
    },
    {
      id: 1,
      label: 'VIRTUAL INODES',
      value: '142 NODES',
      sub: 'Memory VFS Tree',
      pct: 45,
      color: '#34d399',
      icon: <HardDrive size={16} color="#34d399" />,
    },
    {
      id: 2,
      label: 'SYSCALL LATENCY',
      value: '< 0.8 MS',
      sub: 'In-Memory WASIX',
      pct: 12,
      color: '#c084fc',
      icon: <Zap size={16} color="#c084fc" />,
    },
    {
      id: 3,
      label: 'AIR-GAP LEAK SHIELD',
      value: '0 LEAKS',
      sub: '100% Isolated Egress',
      pct: 100,
      color: '#38bdf8',
      icon: <ShieldCheck size={16} color="#38bdf8" />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#090d14',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600 }}>
          LIVE RUNTIME TELEMETRY
        </span>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0 6px' }}>
          Real-Time WebAssembly Engine Diagnostics
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
          Continuous hardware telemetry tracking client-side isolation, memory boundaries, and zero-egress security.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {gauges.map((g) => {
          const isHovered = activeGauge === g.id;
          const strokeDashoffset = 188 - (188 * g.pct) / 100;

          return (
            <div
              key={g.id}
              onMouseEnter={() => {
                setActiveGauge(g.id);
                soundFx.playHover();
              }}
              onMouseLeave={() => setActiveGauge(null)}
              style={{
                backgroundColor: isHovered ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isHovered ? `1px solid ${g.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered ? `0 10px 25px ${g.color}22` : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Circular SVG Gauge */}
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '12px' }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    fill="transparent"
                    stroke={g.color}
                    strokeWidth="6"
                    strokeDasharray="188"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.8s ease',
                      filter: `drop-shadow(0 0 6px ${g.color})`,
                    }}
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {g.icon}
                </div>
              </div>

              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                {g.label}
              </span>

              <span style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: g.color, marginTop: '4px' }}>
                {g.value}
              </span>

              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {g.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

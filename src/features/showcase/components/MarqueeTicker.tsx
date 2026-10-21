import React from 'react';
import {
  Zap,
  ShieldCheck,
  Cpu,
  HardDrive,
  Smartphone,
  CheckCircle2,
  Brain,
  RotateCcw,
} from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const tickerItems = [
    { icon: <Zap size={14} color="#00f0ff" />, label: 'WASIX 1.4 POSIX KERNEL' },
    { icon: <ShieldCheck size={14} color="#10b981" />, label: '100% AIR-GAPPED PRIVACY' },
    { icon: <Cpu size={14} color="#38bdf8" />, label: '<50MS INSTANT COLD START' },
    { icon: <HardDrive size={14} color="#f59e0b" />, label: 'DEXIE INDEXEDDB LOCAL-FIRST' },
    { icon: <Smartphone size={14} color="#c084fc" />, label: 'TOUCH ACCESSORY BAR READY' },
    { icon: <CheckCircle2 size={14} color="#34d399" />, label: 'DETERMINISTIC EVALUATION' },
    { icon: <Brain size={14} color="#ec4899" />, label: 'RETENTION DECAY MODEL' },
    { icon: <RotateCcw size={14} color="#00f0ff" />, label: '12MS INSTANT SNAPSHOT RESET' },
  ];

  return (
    <div
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(10, 14, 22, 0.95)',
        borderTop: '1px solid rgba(56, 189, 248, 0.2)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        padding: '12px 0',
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: '36px',
          animation: 'marqueeScroll 28s linear infinite',
        }}
      >
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              letterSpacing: '1px',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)', marginLeft: '16px' }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

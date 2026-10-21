import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, ShieldCheck, Zap, Terminal } from 'lucide-react';

interface ChaosCommand {
  cmd: string;
  name: string;
  impact: string;
}

const CHAOS_COMMANDS: ChaosCommand[] = [
  {
    cmd: 'rm -rf /*',
    name: 'Root Wipeout',
    impact: 'Destroys entire virtual filesystem tree & binaries',
  },
  {
    cmd: ':(){ :|:& };:',
    name: 'Fork Bomb',
    impact: 'Infinite recursive process spawn attempting kernel OOM',
  },
  {
    cmd: 'chmod -R 000 /',
    name: 'Total Permission Lockout',
    impact: 'Revokes read/write/execute from every user including root',
  },
];

export const ChaosSimulator: React.FC = () => {
  const [activeCmd, setActiveCmd] = useState<ChaosCommand>(CHAOS_COMMANDS[0]!);
  const [status, setStatus] = useState<'idle' | 'glitching' | 'recovering' | 'healed'>('idle');
  const [outputLogs, setOutputLogs] = useState<string[]>([
    '[Kernel] Snapshot baseline: SHA-256 (3c8bf7e) active.',
    '[Sandbox] 0 processes quarantined. Zero host filesystem access.',
  ]);

  const triggerChaos = (cmdObj: ChaosCommand) => {
    setActiveCmd(cmdObj);
    setStatus('glitching');
    setOutputLogs([
      `student@shellground:~$ ${cmdObj.cmd}`,
      '⚡ [ALERT] Critical POSIX system call executed!',
      '💥 [CRASH] Kernel panic simulated: filesystem integrity compromised.',
      '🛑 [SANDBOX] Memory barrier trapped catastrophic failure.',
    ]);

    setTimeout(() => {
      setStatus('recovering');
      setOutputLogs((prev) => [
        ...prev,
        '🔄 [RECOVERY] Initiating zero-latency WebAssembly state rollback...',
        '📦 [MEMFS] Restoring clean IndexedDB memory image...',
      ]);

      setTimeout(() => {
        setStatus('healed');
        setOutputLogs((prev) => [
          ...prev,
          '✨ [RESTORED] Clean state recreation complete in 12ms!',
          '🛡️ [SAFETY] Host laptop OS was 100% untouched and safe.',
        ]);
      }, 700);
    }, 900);
  };

  const handleReset = () => {
    setStatus('idle');
    setOutputLogs([
      '[Kernel] Snapshot baseline: SHA-256 (3c8bf7e) active.',
      '[Sandbox] 0 processes quarantined. Zero host filesystem access.',
    ]);
  };

  return (
    <div
      style={{
        backgroundColor: '#0a0d14',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: status === 'glitching'
          ? '0 0 35px rgba(239, 68, 68, 0.4)'
          : status === 'healed'
          ? '0 0 35px rgba(16, 185, 129, 0.3)'
          : '0 16px 40px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: status === 'glitching' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color={status === 'glitching' ? '#ef4444' : '#f59e0b'} />
          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-heading)' }}>
            CHAOS SIMULATOR: BREAK & SELF-HEAL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status === 'idle' && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> SECURE BASELINE
            </span>
          )}
          {status === 'glitching' && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 700, animation: 'pulseNeon 0.5s infinite' }}>
              ⚠️ SYSTEM DESTABILIZED
            </span>
          )}
          {status === 'recovering' && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
              🔄 RECOVERING IN MEMORY...
            </span>
          )}
          {status === 'healed' && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} /> HEALED (12ms)
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
            Dare to run the most destructive Linux commands without risking your machine. Watch ShellGround isolate the crash and restore a clean state in under 12 milliseconds:
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CHAOS_COMMANDS.map((item) => (
              <button
                key={item.cmd}
                onClick={() => triggerChaos(item)}
                disabled={status === 'glitching' || status === 'recovering'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: activeCmd.cmd === item.cmd && status !== 'idle'
                    ? '1px solid #ef4444'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: status === 'glitching' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Terminal size={12} />
                <span>{item.cmd}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>({item.name})</span>
              </button>
            ))}

            {status === 'healed' && (
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>

        {/* Simulated Log Output Window */}
        <div
          style={{
            backgroundColor: '#05070a',
            border: status === 'glitching'
              ? '1px solid rgba(239, 68, 68, 0.6)'
              : status === 'healed'
              ? '1px solid rgba(16, 185, 129, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.6,
            minHeight: '120px',
            transition: 'border-color 0.25s ease',
          }}
        >
          {outputLogs.map((line, idx) => {
            const isAlert = line.includes('[ALERT]') || line.includes('[CRASH]');
            const isHeal = line.includes('[RESTORED]') || line.includes('[SAFETY]');
            const isRec = line.includes('[RECOVERY]');
            return (
              <div
                key={idx}
                style={{
                  color: isAlert ? '#f87171' : isHeal ? '#34d399' : isRec ? '#38bdf8' : 'var(--color-text-secondary)',
                  fontWeight: isAlert || isHeal ? 600 : 400,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

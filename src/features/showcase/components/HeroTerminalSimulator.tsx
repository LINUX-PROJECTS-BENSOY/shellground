import React, { useState, useRef, useCallback } from 'react';
import { Terminal, Play, RefreshCw } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'prompt' | 'stdout' | 'stderr' | 'info';
  content: string;
  color?: string;
}

const PRESET_SCRIPTS: Record<string, { cmd: string; output: string[] }> = {
  'tree': {
    cmd: 'tree -L 2 /workspace',
    output: [
      '\x1b[34m/workspace\x1b[0m',
      '├── \x1b[34mdocs\x1b[0m',
      '│   ├── architecture.md',
      '│   └── security-policy.txt',
      '├── \x1b[32;1mapp.sh\x1b[0m [executable]',
      '├── \x1b[33mserver.log\x1b[0m',
      '└── welcome.txt',
      '',
      '2 directories, 4 files (virtual memfs)',
    ],
  },
  'ls': {
    cmd: 'ls -la',
    output: [
      'total 24',
      'drwxr-xr-x 4 student student 4096 Oct 21 15:00 .',
      'drwxr-xr-x 3 root    root    4096 Oct 21 14:00 ..',
      '-rw-r--r-- 1 student student  240 Oct 21 15:00 .bashrc',
      '-rwxr-xr-x 1 student student 1024 Oct 21 15:00 app.sh',
      '-rw-r--r-- 1 student student 3512 Oct 21 15:00 server.log',
      '-rw-r--r-- 1 student student  142 Oct 21 15:00 welcome.txt',
    ],
  },
  'os': {
    cmd: 'cat /etc/os-release',
    output: [
      'NAME="ShellGround WASIX POSIX Virtual Linux"',
      'VERSION="1.4.0-WASM"',
      'ID=shellground-wasix',
      'PRETTY_NAME="ShellGround WASIX WebAssembly Kernel (Isolated)"',
      'HOME_URL="https://shellground.pages.dev"',
      'SECURITY_POLICY="ZERO_NETWORK_EGRESS_AIR_GAPPED"',
    ],
  },
  'touch': {
    cmd: 'touch mission_alpha.log && chmod 755 mission_alpha.log',
    output: [
      '\x1b[32m[VirtualFS]\x1b[0m Created /workspace/mission_alpha.log (+NEW)',
      '\x1b[32m[VirtualFS]\x1b[0m Permissions updated to -rwxr-xr-x (mode 0755)',
      '\x1b[36m[Observer]\x1b[0m Spatial Directory Tree updated in 4ms',
    ],
  },
  'grep': {
    cmd: 'grep -rn "ERROR" /workspace/server.log',
    output: [
      '\x1b[33m/workspace/server.log:14:\x1b[0m [CRITICAL] Authentication failure from 192.168.1.42',
      '\x1b[33m/workspace/server.log:28:\x1b[0m [ERROR] Unhandled exception in telemetry collector',
      '\x1b[32mMatch count: 2 lines located\x1b[0m',
    ],
  },
};

export const HeroTerminalSimulator: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'info', content: '┌─────────────────────────────────────────────────────────────┐' },
    { id: '2', type: 'info', content: '│  SHELLGROUND v0.1 • WASIX WebAssembly Linux Training Range  │' },
    { id: '3', type: 'info', content: '│  Zero-Server Sandboxing • Local-First Memory Filesystem     │' },
    { id: '4', type: 'info', content: '└─────────────────────────────────────────────────────────────┘' },
    { id: '5', type: 'prompt', content: 'guest@shellground:~/workspace$ tree -L 2 /workspace' },
    ...PRESET_SCRIPTS['tree']!.output.map((out, idx) => ({
      id: `out-init-${idx}`,
      type: 'stdout' as const,
      content: out,
    })),
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [activeChip, setActiveChip] = useState<string>('tree');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const runCommand = useCallback((key: string) => {
    const script = PRESET_SCRIPTS[key];
    if (!script || isTyping) return;

    setActiveChip(key);
    setIsTyping(true);
    setCurrentTypingText('');

    const fullCmd = script.cmd;
    let charIdx = 0;

    const interval = setInterval(() => {
      charIdx++;
      setCurrentTypingText(fullCmd.slice(0, charIdx));

      if (charIdx >= fullCmd.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTyping(false);
          setCurrentTypingText('');

          setLines((prev) => [
            ...prev,
            { id: `prompt-${Date.now()}`, type: 'prompt', content: `guest@shellground:~/workspace$ ${fullCmd}` },
            ...script.output.map((out, idx) => ({
              id: `out-${Date.now()}-${idx}`,
              type: 'stdout' as const,
              content: out,
            })),
          ]);
          scrollToBottom();
        }, 150);
      }
    }, 28);
  }, [isTyping]);

  const handleClear = () => {
    setLines([
      { id: 'c1', type: 'info', content: 'SHELLGROUND WASIX Terminal Console Cleared.' },
    ]);
  };

  // Format ANSI-like color codes in simulated terminal output
  const renderLineContent = (text: string) => {
    if (text.includes('\x1b[')) {
      // Basic ANSI parsing for colors
      // eslint-disable-next-line no-control-regex
      const parts = text.split(/(\x1b\[[0-9;]*m)/);
      let currentColor = '#c9d1d9';
      let isBold = false;

      return parts.map((part, i) => {
        if (part.startsWith('\x1b[')) {
          if (part.includes('34m')) currentColor = '#58a6ff';
          else if (part.includes('32m') || part.includes('32;1m')) currentColor = '#3fb950';
          else if (part.includes('33m')) currentColor = '#d29922';
          else if (part.includes('36m')) currentColor = '#39c5cf';
          else if (part.includes('31m')) currentColor = '#f85149';
          else if (part.includes('0m')) {
            currentColor = '#c9d1d9';
            isBold = false;
          }
          if (part.includes(';1m')) isBold = true;
          return null;
        }
        return (
          <span key={i} style={{ color: currentColor, fontWeight: isBold ? 700 : 400 }}>
            {part}
          </span>
        );
      });
    }

    return text;
  };

  return (
    <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
      {/* Terminal Window Chrome */}
      <div className="showcase-terminal-box">
        {/* Title Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#161b22',
            borderBottom: '1px solid rgba(48, 54, 61, 0.8)',
          }}
        >
          {/* Traffic Light Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }} />
          </div>

          {/* Window Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Terminal size={14} color="var(--color-accent)" />
            <span>guest@shellground: ~/workspace (wasix-v1.4)</span>
          </div>

          {/* Status Light */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                boxShadow: '0 0 8px #3fb950',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            minHeight: '260px',
            maxHeight: '340px',
            overflowY: 'auto',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            backgroundColor: 'var(--terminal-bg)',
            color: 'var(--terminal-fg)',
          }}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              style={{
                color: line.type === 'prompt' ? 'var(--color-text-heading)' : line.type === 'info' ? 'var(--color-accent)' : 'inherit',
                fontWeight: line.type === 'prompt' ? 600 : 400,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {line.type === 'prompt' ? (
                <>
                  <span style={{ color: '#3fb950' }}>guest@shellground</span>
                  <span style={{ color: '#8b949e' }}>:</span>
                  <span style={{ color: '#58a6ff' }}>~/workspace</span>
                  <span style={{ color: '#f0f6fc' }}>$ </span>
                  <span>{line.content.replace('guest@shellground:~/workspace$ ', '')}</span>
                </>
              ) : (
                renderLineContent(line.content)
              )}
            </div>
          ))}

          {/* Typing Buffer */}
          {isTyping && (
            <div style={{ color: 'var(--color-text-heading)', fontWeight: 600 }}>
              <span style={{ color: '#3fb950' }}>guest@shellground</span>
              <span style={{ color: '#8b949e' }}>:</span>
              <span style={{ color: '#58a6ff' }}>~/workspace</span>
              <span style={{ color: '#f0f6fc' }}>$ </span>
              <span>{currentTypingText}</span>
              <span style={{ animation: 'cursorBlink 0.8s infinite', color: 'var(--color-accent)' }}>▌</span>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Command Try Chips Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#161b22',
            borderTop: '1px solid rgba(48, 54, 61, 0.8)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Try sample:
            </span>

            <button
              className="showcase-chip"
              onClick={() => runCommand('tree')}
              disabled={isTyping}
              style={{ borderColor: activeChip === 'tree' ? 'var(--color-accent)' : undefined }}
            >
              <Play size={10} color="var(--color-accent)" />
              <span>tree</span>
            </button>

            <button
              className="showcase-chip"
              onClick={() => runCommand('ls')}
              disabled={isTyping}
              style={{ borderColor: activeChip === 'ls' ? 'var(--color-accent)' : undefined }}
            >
              <Play size={10} color="var(--color-accent)" />
              <span>ls -la</span>
            </button>

            <button
              className="showcase-chip"
              onClick={() => runCommand('touch')}
              disabled={isTyping}
              style={{ borderColor: activeChip === 'touch' ? 'var(--color-accent)' : undefined }}
            >
              <Play size={10} color="var(--color-accent)" />
              <span>touch & chmod</span>
            </button>

            <button
              className="showcase-chip"
              onClick={() => runCommand('grep')}
              disabled={isTyping}
              style={{ borderColor: activeChip === 'grep' ? 'var(--color-accent)' : undefined }}
            >
              <Play size={10} color="var(--color-accent)" />
              <span>grep logs</span>
            </button>

            <button
              className="showcase-chip"
              onClick={() => runCommand('os')}
              disabled={isTyping}
              style={{ borderColor: activeChip === 'os' ? 'var(--color-accent)' : undefined }}
            >
              <Play size={10} color="var(--color-accent)" />
              <span>os-release</span>
            </button>
          </div>

          <button
            onClick={handleClear}
            title="Clear terminal buffer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={11} />
            <span>clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};

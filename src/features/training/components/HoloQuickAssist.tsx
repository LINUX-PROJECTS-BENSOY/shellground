import React, { useState } from 'react';
import {
  Zap,
  X,
  Search,
  Copy,
  Terminal,
  Check,
  Folder,
  FileText,
  Cpu,
  Lock,
  GitFork,
  Box,
} from 'lucide-react';
import { soundFx } from '../../showcase/utils/soundEffects';
import type { TerminalProcessPort } from '../../../terminal/terminal.types';
import type { TerminalController } from '../../../terminal/TerminalController';

interface Snippet {
  id: string;
  category: 'files' | 'text' | 'process' | 'security' | 'pipes';
  cmd: string;
  desc: string;
}

const COMMAND_SNIPPETS: Snippet[] = [
  // Files & Directories
  { id: 'pwd', category: 'files', cmd: 'pwd', desc: 'Print current working directory' },
  { id: 'ls-la', category: 'files', cmd: 'ls -la', desc: 'List all files including hidden with permissions' },
  { id: 'mkdir-p', category: 'files', cmd: 'mkdir -p project/src/bin', desc: 'Create nested directory hierarchy' },
  { id: 'touch', category: 'files', cmd: 'touch notes.txt', desc: 'Create empty file or update timestamp' },
  { id: 'cp-r', category: 'files', cmd: 'cp -r src/ backup/', desc: 'Copy directory recursively' },
  { id: 'rm-rf', category: 'files', cmd: 'rm -rf temp/', desc: 'Remove directory and contents recursively' },

  // Text & Search
  { id: 'cat', category: 'text', cmd: 'cat /etc/os-release', desc: 'Display entire file content to stdout' },
  { id: 'head', category: 'text', cmd: 'head -n 5 server.log', desc: 'Display first 5 lines of a file' },
  { id: 'tail', category: 'text', cmd: 'tail -n 10 server.log', desc: 'Display last 10 lines of a file' },
  { id: 'grep', category: 'text', cmd: 'grep -rn "ERROR" /workspace', desc: 'Search recursively with line numbers' },
  { id: 'wc', category: 'text', cmd: 'wc -l server.log', desc: 'Count total lines in a file' },
  { id: 'sort-uniq', category: 'text', cmd: 'sort access.log | uniq -c', desc: 'Sort lines and count unique occurrences' },

  // Process & System
  { id: 'ps-aux', category: 'process', cmd: 'ps aux', desc: 'List all active running processes' },
  { id: 'top', category: 'process', cmd: 'top -b -n 1', desc: 'One-shot snapshot of CPU and memory usage' },
  { id: 'kill', category: 'process', cmd: 'kill -9 <PID>', desc: 'Send non-catchable SIGKILL to terminate process' },
  { id: 'free', category: 'process', cmd: 'free -m', desc: 'Display memory usage in megabytes' },
  { id: 'uname', category: 'process', cmd: 'uname -a', desc: 'Print kernel name, release, and architecture' },
  { id: 'uptime', category: 'process', cmd: 'uptime', desc: 'Display system uptime and load average' },

  // Security & Permissions
  { id: 'chmod-755', category: 'security', cmd: 'chmod 755 script.sh', desc: 'Read/write/exec for owner, read/exec for others' },
  { id: 'chmod-600', category: 'security', cmd: 'chmod 600 id_rsa', desc: 'Read/write only for owner (private keys)' },
  { id: 'stat', category: 'security', cmd: 'stat script.sh', desc: 'Display detailed inode and permission metadata' },
  { id: 'df', category: 'security', cmd: 'df -h', desc: 'Display human-readable disk and memory filesystem usage' },

  // Pipelines & Streams
  { id: 'pipe-filter', category: 'pipes', cmd: 'cat access.log | grep 404 | wc -l', desc: 'Count HTTP 404 occurrences via pipeline' },
  { id: 'redirect-out', category: 'pipes', cmd: 'echo "hello wasix" > greeting.txt', desc: 'Redirect stdout to file (overwrite)' },
  { id: 'redirect-append', category: 'pipes', cmd: 'echo "system online" >> app.log', desc: 'Append stdout to existing file' },
];

export interface HoloQuickAssistProps {
  processPort?: TerminalProcessPort;
  controller?: TerminalController | null;
  themeColor?: string;
}

export const HoloQuickAssist: React.FC<HoloQuickAssistProps> = ({
  processPort,
  controller,
  themeColor = '#00f0ff',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'files' | 'text' | 'process' | 'security' | 'pipes'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleOpen = () => {
    soundFx.playWarp();
    setIsOpen((prev) => !prev);
  };

  const handleCopy = (snippet: Snippet, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSnap();
    navigator.clipboard.writeText(snippet.cmd);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInject = (snippet: Snippet, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playTyping();
    if (processPort) {
      processPort.writeInput(`${snippet.cmd}\r`);
    }
    if (controller) {
      controller.focus();
    }
  };

  const filteredSnippets = COMMAND_SNIPPETS.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      s.cmd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {/* Floating Cyber Launcher Button */}
      <button
        onClick={toggleOpen}
        aria-label="Open 3D Holographic Command Dock"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '9999px',
          backgroundColor: isOpen ? themeColor : 'rgba(13, 17, 23, 0.92)',
          border: `1.5px solid ${themeColor}`,
          color: isOpen ? '#000000' : themeColor,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 14px ${themeColor}44`,
          backdropFilter: 'blur(10px)',
          zIndex: 50,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Zap size={14} color={isOpen ? '#000000' : themeColor} />
        <span>3D Command Dock</span>
        <Box size={13} style={{ animation: 'spinGradient 12s linear infinite' }} />
      </button>

      {/* Cyberpunk Floating Assist Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="3D Holographic Command Dock"
          style={{
            position: 'fixed',
            bottom: '68px',
            right: '16px',
            width: 'clamp(320px, 90vw, 440px)',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'rgba(10, 14, 22, 0.96)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${themeColor}55`,
            borderRadius: '16px',
            boxShadow: `0 16px 40px rgba(0, 0, 0, 0.8), 0 0 30px ${themeColor}22`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 50,
            animation: 'fadeInScale 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: `${themeColor}22`,
                  border: `1px solid ${themeColor}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Terminal size={15} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  Interactive 3D Command Dock
                </div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  One-click injection into active WASIX terminal
                </div>
              </div>
            </div>

            <button
              onClick={toggleOpen}
              aria-label="Close Command Dock"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(5, 8, 14, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 10px',
              }}
            >
              <Search size={14} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search commands, flags, or concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  width: '100%',
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 16px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {[
              { id: 'all', label: 'All', icon: Zap },
              { id: 'files', label: 'Files', icon: Folder },
              { id: 'text', label: 'Text', icon: FileText },
              { id: 'process', label: 'Process', icon: Cpu },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'pipes', label: 'Pipes', icon: GitFork },
            ].map((cat) => {
              const isSelected = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playHover();
                    setActiveCategory(cat.id as typeof activeCategory);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? `${themeColor}25` : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? themeColor : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={11} color={isSelected ? themeColor : undefined} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Snippet List */}
          <div
            style={{
              padding: '12px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
            }}
          >
            {filteredSnippets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                No commands matched &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  style={{
                    backgroundColor: 'rgba(13, 17, 23, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code
                      style={{
                        color: themeColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {snippet.cmd}
                    </code>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={(e) => handleCopy(snippet, e)}
                        title="Copy command to clipboard"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          padding: '3px 6px',
                          color: copiedId === snippet.id ? 'var(--color-success)' : 'var(--color-text-secondary)',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === snippet.id ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedId === snippet.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {processPort && (
                        <button
                          onClick={(e) => handleInject(snippet, e)}
                          title="Inject command into active terminal and run"
                          style={{
                            background: `${themeColor}22`,
                            border: `1px solid ${themeColor}66`,
                            borderRadius: '4px',
                            padding: '3px 6px',
                            color: '#ffffff',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          <Terminal size={11} color={themeColor} />
                          <span>Run</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {snippet.desc}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

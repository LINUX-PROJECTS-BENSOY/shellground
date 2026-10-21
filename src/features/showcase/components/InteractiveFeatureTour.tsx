import React, { useState } from 'react';
import {
  FolderTree,
  Cpu,
  CheckCircle2,
  Award,
  Plus,
  Trash2,
  FileCode2,
  ArrowRight,
} from 'lucide-react';

type FeatureTab = 'filesystem' | 'kernel' | 'validator' | 'mastery';

interface DemoFile {
  name: string;
  type: 'file' | 'dir';
  status?: 'new' | 'modified' | 'deleted';
  size?: string;
}

export const InteractiveFeatureTour: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('filesystem');

  // Filesystem interactive state
  const [demoFiles, setDemoFiles] = useState<DemoFile[]>([
    { name: 'workspace', type: 'dir' },
    { name: 'server.py', type: 'file', size: '1.2 KB' },
    { name: 'README.md', type: 'file', size: '420 B' },
  ]);
  const [lastFsAction, setLastFsAction] = useState<string>('Sandbox initial state loaded');

  const handleCreateFile = () => {
    const filename = `canary_${Math.floor(Math.random() * 900 + 100)}.txt`;
    setDemoFiles((prev) => [
      ...prev,
      { name: filename, type: 'file', status: 'new', size: '24 B' },
    ]);
    setLastFsAction(`touch /workspace/${filename} → +NEW node registered`);
  };

  const handleCreateDir = () => {
    const dirname = `logs_${Math.floor(Math.random() * 90 + 10)}`;
    setDemoFiles((prev) => [
      ...prev,
      { name: dirname, type: 'dir', status: 'new' },
    ]);
    setLastFsAction(`mkdir -p /workspace/${dirname} → +DIR directory created`);
  };

  const handleResetDemoFs = () => {
    setDemoFiles([
      { name: 'workspace', type: 'dir' },
      { name: 'server.py', type: 'file', size: '1.2 KB' },
      { name: 'README.md', type: 'file', size: '420 B' },
    ]);
    setLastFsAction('Filesystem snapshot restored to baseline');
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(15, 20, 30, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.08)',
      }}
    >
      {/* Tour Header with Feature Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(48, 54, 61, 0.8)',
          backgroundColor: 'rgba(10, 14, 22, 0.9)',
          padding: '8px 12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('filesystem')}
            className={`bento-tab-btn ${activeTab === 'filesystem' ? 'is-active' : ''}`}
            aria-label="Explore Live Filesystem Explorer"
          >
            <FolderTree size={16} />
            <span>Spatial Filesystem</span>
          </button>

          <button
            onClick={() => setActiveTab('kernel')}
            className={`bento-tab-btn ${activeTab === 'kernel' ? 'is-active' : ''}`}
            aria-label="Explore WASIX Virtual Kernel"
          >
            <Cpu size={16} />
            <span>WASIX Kernel</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`bento-tab-btn ${activeTab === 'validator' ? 'is-active' : ''}`}
            aria-label="Explore Outcome Validation Engine"
          >
            <CheckCircle2 size={16} />
            <span>Outcome Validator</span>
          </button>

          <button
            onClick={() => setActiveTab('mastery')}
            className={`bento-tab-btn ${activeTab === 'mastery' ? 'is-active' : ''}`}
            aria-label="Explore Retention Skill Analytics"
          >
            <Award size={16} />
            <span>Skill Analytics</span>
          </button>
        </div>

        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent)',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          INTERACTIVE DEMO
        </div>
      </div>

      {/* Interactive Stage Content */}
      <div style={{ padding: '24px' }}>
        {/* Tab 1: Spatial Filesystem Demo */}
        {activeTab === 'filesystem' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                REAL-TIME MUTATION DIFFING
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '6px 0 10px' }}>
                Instant Visual Filesystem Feedback
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Every command you type directly updates the browser virtual disk. Try clicking the action buttons below to simulate running commands in the terminal:
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button
                  onClick={handleCreateFile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#34d399',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                  }}
                >
                  <Plus size={14} />
                  <span>touch file.txt</span>
                </button>

                <button
                  onClick={handleCreateDir}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
                  }}
                >
                  <Plus size={14} />
                  <span>mkdir logs</span>
                </button>

                <button
                  onClick={handleResetDemoFs}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-default)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Reset Tree</span>
                </button>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span style={{ color: 'var(--color-accent)' }}>Last Mutation:</span> {lastFsAction}
              </div>
            </div>

            {/* Simulated Live Tree Panel */}
            <div
              style={{
                backgroundColor: '#0a0d14',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '8px',
                  marginBottom: '12px',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>PATH: /workspace</span>
                <span style={{ color: 'var(--color-success)' }}>● WATCHING</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {demoFiles.map((f, i) => (
                  <div
                    key={f.name + i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      backgroundColor: f.status === 'new' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      border: f.status === 'new' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      animation: f.status === 'new' ? 'pulseEmerald 1.5s ease-out' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {f.type === 'dir' ? (
                        <FolderTree size={14} color="#38bdf8" />
                      ) : (
                        <FileCode2 size={14} color="var(--color-text-secondary)" />
                      )}
                      <span style={{ color: f.type === 'dir' ? '#38bdf8' : 'var(--color-text-primary)' }}>
                        {f.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {f.status === 'new' && (
                        <span
                          style={{
                            fontSize: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontWeight: 700,
                          }}
                        >
                          + NEW
                        </span>
                      )}
                      {f.size && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{f.size}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: WASIX Kernel Demo */}
        {activeTab === 'kernel' && (
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              TRUE POSIX PROCESS ISOLATION
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '6px 0 10px' }}>
              Full Linux Pipeline Execution
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: '700px' }}>
              WebAssembly executes compiled C/Rust binaries in memory. Standard pipes, environment variables, exit codes, and file descriptors operate just like real Ubuntu or Debian:
            </p>

            <div
              style={{
                backgroundColor: '#0a0d14',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '18px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ color: '#38bdf8' }}>student@shellground:~$</span>
                <span style={{ color: '#f0f6fc', fontWeight: 600 }}>cat /var/log/nginx/access.log | grep "404" | wc -l</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>FD 0: STDIN / STDOUT</div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px' }}>cat access.log</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-success)', marginTop: '2px' }}>Stream 8.4 KB</div>
                </div>

                <ArrowRight size={18} color="var(--color-accent)" />

                <div
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>FD 1: PIPE INTERCEPT</div>
                  <div style={{ fontSize: '13px', color: '#34d399', marginTop: '4px' }}>grep "404"</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-success)', marginTop: '2px' }}>Filtered 14 matches</div>
                </div>

                <ArrowRight size={18} color="var(--color-accent)" />

                <div
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#34d399' }}>OUTPUT / EXIT 0</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>14</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Exit status: 0 (Success)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Outcome Validator Demo */}
        {activeTab === 'validator' && (
          <div>
            <span style={{ fontSize: '12px', color: '#c084fc', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              DETERMINISTIC EVALUATION
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '6px 0 10px' }}>
              Multi-Rule Automated Validation
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              No fuzzy AI guesswork. ShellGround uses deterministic rule checkers to verify your commands against strict filesystem states and hashes:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { label: 'File Existence Check', target: '/workspace/script.sh exists', pass: true },
                { label: 'Executable Permissions', target: 'File mode is 0755 (-rwxr-xr-x)', pass: true },
                { label: 'Content Hash Integrity', target: 'SHA-256 digest verified', pass: true },
                { label: 'Process Exit Status', target: 'Command terminated with code 0', pass: true },
              ].map((rule) => (
                <div
                  key={rule.label}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>{rule.label}</span>
                    <CheckCircle2 size={16} color="#34d399" />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {rule.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Skill Analytics Demo */}
        {activeTab === 'mastery' && (
          <div>
            <span style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              COGNITIVE RETENTION
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '6px 0 10px' }}>
              Algorithmic Skill Decay & Radar Tracking
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Knowledge isn't static. ShellGround measures your recall confidence across 8 Linux domains with spaced-repetition decay modeling:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {[
                { name: 'Navigation & Paths', score: 95, color: '#34d399' },
                { name: 'File Manipulation', score: 88, color: '#38bdf8' },
                { name: 'Permissions & Modes', score: 76, color: '#c084fc' },
                { name: 'Pipes & Redirection', score: 82, color: '#f59e0b' },
              ].map((skill) => (
                <div
                  key={skill.name}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-primary)' }}>{skill.name}</span>
                    <span style={{ color: skill.color, fontWeight: 700 }}>{skill.score}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${skill.score}%`,
                        backgroundColor: skill.color,
                        borderRadius: '3px',
                        boxShadow: `0 0 8px ${skill.color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

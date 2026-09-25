import React, { useState, useEffect } from 'react';
import { detectBrowserCapabilities, RuntimeCapabilityReport } from '@domain/runtime/RuntimeCapability';
import { APP_CONFIG } from './config/app-config';

export const App: React.FC = () => {
  const [capabilities, setCapabilities] = useState<RuntimeCapabilityReport | null>(null);

  useEffect(() => {
    setCapabilities(detectBrowserCapabilities());
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, letterSpacing: '1px', color: 'var(--color-accent)' }}>
            &gt;_ {APP_CONFIG.appName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            v{APP_CONFIG.appVersion}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <span className="terminal-status-badge badge-isolated">
            ● Network: Disabled
          </span>
          <span className="terminal-status-badge badge-ready">
            ● Sandbox: WASIX
          </span>
          <a
            href={APP_CONFIG.docsUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
          >
            Documentation ↗
          </a>
        </div>
      </header>

      {/* Capability Warning Banner if any */}
      {capabilities && !capabilities.isFullySupported && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(248, 81, 73, 0.15)',
            borderBottom: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            fontSize: '13px',
          }}
        >
          <strong>Browser Compatibility Warning:</strong>
          <ul style={{ margin: '4px 0 0 20px' }}>
            {capabilities.blockingFailures.map((failure, idx) => (
              <li key={idx}>{failure}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Mission / Lab Sidebar */}
        <aside
          style={{
            width: '320px',
            backgroundColor: 'var(--color-bg-canvas)',
            borderRight: '1px solid var(--color-border-default)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border-default)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            MISSION: 001-where-am-i
          </div>
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto', fontSize: '13px', lineHeight: 1.6 }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Welcome to <strong>SHELLGROUND</strong>. Your training terminal runs client-side inside an isolated WASIX sandbox.
            </p>
            <h4 style={{ color: 'var(--color-text-heading)', marginTop: '16px', marginBottom: '8px' }}>
              Objective
            </h4>
            <p style={{ color: 'var(--color-text-primary)' }}>
              Determine the current working directory of your shell session using the standard command.
            </p>
          </div>
        </aside>

        {/* Terminal Container */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--terminal-bg)' }}>
          <div
            style={{
              flex: 1,
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              color: 'var(--terminal-fg)',
            }}
          >
            <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              [SHELLGROUND Runtime: Initializing client-side WASIX worker...]
            </div>
            <div>
              <span style={{ color: 'var(--color-success)' }}>student@shellground</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>:</span>
              <span style={{ color: 'var(--color-accent)' }}>~</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>$ </span>
              <span className="cursor-blink">█</span>
            </div>
          </div>

          {/* Terminal Bottom Statusbar */}
          <footer className="terminal-statusbar">
            <div>
              <span>Mode: <strong>LEARN</strong></span> | <span>CWD: <strong>/home/student</strong></span>
            </div>
            <div>
              <span>Shortcuts: <strong>Ctrl+L</strong> Clear | <strong>Ctrl+C</strong> Interrupt</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

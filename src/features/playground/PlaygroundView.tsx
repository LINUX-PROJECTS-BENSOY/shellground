import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { TerminalView } from '../../terminal/TerminalView';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { InteractiveLabSession } from '../training/services/InteractiveLabSession';
import type { LabDefinition } from '../../domain/content/schemas';

export const PlaygroundView: React.FC = () => {
  const { registry, telemetryService, repositories } = useAppStore();

  const dummyLab: LabDefinition = {
    id: 'playground-sandbox',
    version: 1,
    packId: 'linux-foundations',
    title: 'Free Exploration Playground',
    difficulty: 'beginner',
    mission: {
      objective: 'Practice Linux commands freely in an isolated WASIX virtual environment.',
    },
    fixture: {
      id: 'file-ops-workspace',
      version: 1,
    },
    concepts: ['filesystem.paths'],
    validators: [],
  };

  const sessionRef = useRef<InteractiveLabSession | null>(null);
  const [sessionKey, setSessionKey] = useState<string>(() => `playground-${Date.now()}`);

  useEffect(() => {
    sessionRef.current = new InteractiveLabSession(
      dummyLab,
      registry,
      telemetryService,
      repositories?.commandHistory
    );
    setSessionKey(`playground-${Date.now()}`);
  }, [registry, telemetryService, repositories?.commandHistory]);

  const handleReset = () => {
    if (!sessionRef.current) return;
    sessionRef.current.hydrateFixture();
    sessionRef.current.emitWelcomeBanner();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Playground Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
              Open Command Playground
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Zero-consequence sandbox for experimentation, pipelining, and exploratory scripting.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Badge variant="real">native-wasix</Badge>
          <Badge variant="isolated">Network: Disabled</Badge>
          <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={handleReset}>
            Reset Sandbox
          </Button>
        </div>
      </div>

      {/* Terminal View Container */}
      <div style={{ flex: 1, backgroundColor: 'var(--terminal-bg)', overflow: 'hidden', position: 'relative' }}>
        {sessionRef.current && (
          <TerminalView
            key={sessionKey}
            processPort={sessionRef.current}
            onTerminalReady={() => {
              sessionRef.current?.emitWelcomeBanner();
            }}
            showStatusBar={true}
            statusText="Playground Mode — Free Sandbox"
          />
        )}
      </div>
    </div>
  );
};

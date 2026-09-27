import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { TerminalView } from '../../terminal/TerminalView';
import { TerminalTouchBar } from '../../terminal/components/TerminalTouchBar';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { InteractiveLabSession } from '../training/services/InteractiveLabSession';
import { useIsMobile } from '../../shared/hooks/useMediaQuery';
import type { LabDefinition } from '../../domain/content/schemas';

export const PlaygroundView: React.FC = () => {
  const { registry, telemetryService, repositories } = useAppStore();
  const isMobile = useIsMobile();

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
          padding: isMobile ? '8px 10px' : '10px 16px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <div>
            <h2 style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
              {isMobile ? 'Playground' : 'Open Command Playground'}
            </h2>
            {!isMobile && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Zero-consequence sandbox for experimentation, pipelining, and exploratory scripting.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isMobile && <Badge variant="real">native-wasix</Badge>}
          {!isMobile && <Badge variant="isolated">Network: Disabled</Badge>}
          <Button size="sm" variant="secondary" icon={<RotateCcw size={13} />} onClick={handleReset}>
            {isMobile ? 'Reset' : 'Reset Sandbox'}
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
            statusText={isMobile ? 'Playground' : 'Playground Mode — Free Sandbox'}
          />
        )}
      </div>

      {/* Touch Accessory Bar for Mobile */}
      {isMobile && (
        <TerminalTouchBar processPort={sessionRef.current ?? undefined} />
      )}
    </div>
  );
};


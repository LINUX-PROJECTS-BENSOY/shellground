import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RotateCcw, CheckCircle, Lightbulb, Terminal as TerminalIcon } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { ValidationService } from '../../application/labs/ValidationService';
import { calculateSessionScore } from '../../domain/mastery/calculateMastery';
import type { SessionScoreBreakdown } from '../../domain/mastery/MasteryRecord';
import type { ValidationSummary } from '../../domain/validation/Validator';
import { TerminalView } from '../../terminal/TerminalView';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MissionPanel } from './components/MissionPanel';
import { HintDrawer } from './components/HintDrawer';
import { ValidationModal } from './components/ValidationModal';
import { InteractiveLabSession } from './services/InteractiveLabSession';

export const TrainingWorkspace: React.FC = () => {
  const {
    getActiveLab,
    getLabConcepts,
    registry,
    repositories,
    masteryService,
    telemetryService,
    refreshProgress,
    selectLab,
  } = useAppStore();

  const lab = getActiveLab();
  const concepts = useMemo(() => (lab ? getLabConcepts(lab) : []), [lab, getLabConcepts]);

  const [hintsDrawerOpen, setHintsDrawerOpen] = useState(false);
  const [unlockedHintIds, setUnlockedHintIds] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [scoreResult, setScoreResult] = useState<SessionScoreBreakdown | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  const validationService = useMemo(() => new ValidationService(), []);

  // Initialize interactive lab session
  const sessionRef = useRef<InteractiveLabSession | null>(null);
  const [sessionKey, setSessionKey] = useState<string>(() => `${lab?.id ?? 'none'}-${Date.now()}`);

  useEffect(() => {
    if (lab) {
      sessionRef.current = new InteractiveLabSession(
        lab,
        registry,
        telemetryService,
        repositories?.commandHistory
      );
      setSessionKey(`${lab.id}-${Date.now()}`);
      setUnlockedHintIds(new Set());
      setAttempts(1);
      setValidationSummary(null);
      setScoreResult(null);
      setValidationModalOpen(false);
    }
  }, [lab?.id, registry, telemetryService, repositories?.commandHistory]);

  const handleUnlockHint = (hintId: string) => {
    setUnlockedHintIds((prev) => new Set(prev).add(hintId));
  };

  const handleResetLab = () => {
    if (!sessionRef.current || !lab) return;
    sessionRef.current.hydrateFixture();
    setAttempts((prev) => prev + 1);
    setValidationSummary(null);
    setScoreResult(null);
    setValidationModalOpen(false);
    // Print notice in terminal
    sessionRef.current.emitWelcomeBanner();
  };

  const handleValidate = useCallback(async () => {
    if (!sessionRef.current || !lab || isValidating) return;

    setIsValidating(true);
    try {
      const ctx = sessionRef.current.getValidatorContext();
      const summary = await validationService.validateLab(lab, ctx);
      setValidationSummary(summary);

      const score = calculateSessionScore({
        completed: summary.passed,
        hintsUsed: unlockedHintIds.size,
        attempts,
        errorCount: summary.failedCount,
        mode: 'guided',
      });
      setScoreResult(score);

      // Save lab progress
      if (repositories) {
        const labKey = `${lab.packId}::${lab.id}::v${lab.version}`;
        const existing = await repositories.labProgress.get(labKey);

        const bestScore = existing
          ? Math.max(existing.bestScore ?? 0, score.totalScore)
          : score.totalScore;

        await repositories.labProgress.save({
          labKey,
          labId: lab.id,
          labVersion: Number(lab.version),
          packId: lab.packId,
          packVersion: '0.1.0',
          status: summary.passed ? 'completed' : 'in-progress',
          attempts: (existing?.attempts ?? 0) + 1,
          completions: summary.passed ? (existing?.completions ?? 0) + 1 : (existing?.completions ?? 0),
          bestScore,
          lastAttemptAt: new Date().toISOString(),
          lastCompletedAt: summary.passed ? new Date().toISOString() : existing?.lastCompletedAt,
        });
      }

      // Record concept mastery
      if (masteryService && lab.concepts && lab.concepts.length > 0) {
        await masteryService.recordLabOutcome(lab.concepts, {
          completed: summary.passed,
          hintsUsed: unlockedHintIds.size,
          attempts,
          errorCount: summary.failedCount,
          mode: 'guided',
        });
      }

      await refreshProgress();
      setValidationModalOpen(true);
    } catch (err) {
      console.error('[TrainingWorkspace] Validation execution failed:', err);
    } finally {
      setIsValidating(false);
    }
  }, [sessionRef, lab, isValidating, unlockedHintIds.size, attempts, validationService, repositories, masteryService, refreshProgress]);

  // Global Ctrl+Enter shortcut to validate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleValidate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleValidate]);

  if (!lab) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No laboratory selected. Select a lab from the catalog.
      </div>
    );
  }

  const nextLab = registry.getNextLab(lab.packId, lab.id);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Left Panel: Mission & Tasks (Width: 360px) */}
      <div style={{ width: '360px', height: '100%', flexShrink: 0 }}>
        <MissionPanel
          lab={lab}
          concepts={concepts}
          hintsUnlockedCount={unlockedHintIds.size}
          totalHintsCount={lab.hints?.length ?? 0}
          onOpenHints={() => setHintsDrawerOpen(true)}
        />
      </div>

      {/* Right Area: Top Action Bar + Active Terminal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Terminal Header Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            backgroundColor: 'var(--color-bg-subtle)',
            borderBottom: '1px solid var(--color-border-default)',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TerminalIcon size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-heading)', fontFamily: 'var(--font-mono)' }}>
              Terminal Shell [student@shellground]
            </span>
            <Badge variant="real">native-wasix</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              size="sm"
              variant="secondary"
              icon={<RotateCcw size={14} />}
              onClick={handleResetLab}
              title="Re-hydrates the pristine lab fixture"
            >
              Reset Sandbox
            </Button>

            {lab.hints && lab.hints.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Lightbulb size={14} color="var(--color-warning)" />}
                onClick={() => setHintsDrawerOpen(true)}
              >
                Hints ({unlockedHintIds.size}/{lab.hints.length})
              </Button>
            )}

            <Button
              size="sm"
              variant="primary"
              icon={<CheckCircle size={14} />}
              onClick={handleValidate}
              disabled={isValidating}
              title="Shortcut: Ctrl+Enter"
            >
              {isValidating ? 'Validating...' : 'Validate (Ctrl+Enter)'}
            </Button>
          </div>
        </div>

        {/* Terminal Presentation Container */}
        <div style={{ flex: 1, backgroundColor: 'var(--terminal-bg)', overflow: 'hidden', position: 'relative' }}>
          {sessionRef.current && (
            <TerminalView
              key={sessionKey}
              processPort={sessionRef.current}
              onTerminalReady={() => {
                sessionRef.current?.emitWelcomeBanner();
              }}
              showStatusBar={true}
              statusText={`Active Session — Attempt #${attempts}`}
            />
          )}
        </div>
      </div>

      {/* Hints Drawer Modal */}
      {lab.hints && (
        <HintDrawer
          isOpen={hintsDrawerOpen}
          onClose={() => setHintsDrawerOpen(false)}
          hints={lab.hints}
          unlockedHintIds={unlockedHintIds}
          onUnlockHint={handleUnlockHint}
        />
      )}

      {/* Outcome Validation Summary Modal */}
      <ValidationModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        summary={validationSummary}
        scoreResult={scoreResult}
        hasNextLab={nextLab !== undefined}
        onNextLab={() => {
          if (nextLab) {
            selectLab(nextLab.id, nextLab.packId);
          }
        }}
        onRetry={() => setValidationModalOpen(false)}
        onReset={handleResetLab}
      />
    </div>
  );
};

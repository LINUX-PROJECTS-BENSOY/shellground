import React from 'react';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';
import type { ValidationSummary } from '../../../domain/validation/Validator';
import type { SessionScoreBreakdown } from '../../../domain/mastery/MasteryRecord';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ValidationSummary | null;
  scoreResult: SessionScoreBreakdown | null;
  hasNextLab: boolean;
  onNextLab: () => void;
  onRetry: () => void;
  onReset: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  summary,
  scoreResult,
  hasNextLab,
  onNextLab,
  onRetry,
  onReset,
}) => {
  if (!summary) return null;

  const isPassed = summary.passed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPassed ? 'Verification Succeeded' : 'Verification Incomplete'}
      width="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Outcome Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            backgroundColor: isPassed ? 'rgba(63, 185, 80, 0.12)' : 'rgba(248, 81, 73, 0.12)',
            border: '1px solid',
            borderColor: isPassed ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isPassed ? (
              <CheckCircle2 size={32} color="var(--color-success)" />
            ) : (
              <XCircle size={32} color="var(--color-danger)" />
            )}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-heading)' }}>
                {isPassed ? 'Lab Passed — Criteria Satisfied' : 'Verification Failed — Retry Required'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {isPassed
                  ? `All ${summary.totalCount} outcome checks verified against runtime filesystem.`
                  : `${summary.failedCount} of ${summary.totalCount} outcome checks failed.`}
              </p>
            </div>
          </div>

          {scoreResult && isPassed && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Score
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                {scoreResult.totalScore}%
              </div>
            </div>
          )}
        </div>

        {/* Score Breakdown (if passed) */}
        {scoreResult && isPassed && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-canvas)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
            }}
          >
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={14} color="var(--color-warning)" />
              <span>Competency Scoring Breakdown</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Completion:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', marginTop: '2px' }}>
                  +{scoreResult.completionScore} pts
                </div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Attempts:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', marginTop: '2px' }}>
                  +{scoreResult.attemptScore} pts
                </div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Hints Penalty:</span>
                <div style={{ fontWeight: 600, color: scoreResult.hintPenalty > 0 ? 'var(--color-danger)' : 'var(--color-text-heading)', marginTop: '2px' }}>
                  -{scoreResult.hintPenalty} pts
                </div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Fluency:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', marginTop: '2px' }}>
                  +{scoreResult.fluencyScore} pts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validator Checks List */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            Outcome Assertion Results
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.results.map((res, idx) => {
              const pass = res.status === 'pass';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-bg-canvas)',
                    border: '1px solid',
                    borderColor: pass ? 'var(--color-border-muted)' : 'rgba(248, 81, 73, 0.4)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                    <div style={{ marginTop: '2px' }}>
                      {pass ? (
                        <CheckCircle2 size={16} color="var(--color-success)" />
                      ) : (
                        <XCircle size={16} color="var(--color-danger)" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                          {res.validatorId || `check-${idx + 1}`}
                        </span>
                        <Badge variant="neutral">{res.type}</Badge>
                      </div>
                      <p style={{ color: pass ? 'var(--color-text-secondary)' : 'var(--color-danger)', fontSize: '12px', lineHeight: 1.4 }}>
                        {res.message}
                      </p>
                    </div>
                  </div>

                  <Badge variant={pass ? 'success' : 'danger'}>
                    {pass ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-border-default)' }}>
          <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={onReset}>
            Reset Sandbox
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={onRetry}>
              {isPassed ? 'Review Terminal' : 'Back to Terminal'}
            </Button>

            {isPassed && hasNextLab && (
              <Button variant="primary" icon={<ArrowRight size={16} />} onClick={onNextLab}>
                Next Lab
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

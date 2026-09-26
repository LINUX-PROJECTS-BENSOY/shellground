import React from 'react';
import { Lightbulb, Unlock, AlertTriangle } from 'lucide-react';
import type { HintDefinition } from '../../../domain/content/schemas';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export interface HintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hints: HintDefinition[];
  unlockedHintIds: Set<string>;
  onUnlockHint: (hintId: string) => void;
}

export const HintDrawer: React.FC<HintDrawerProps> = ({
  isOpen,
  onClose,
  hints,
  unlockedHintIds,
  onUnlockHint,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Progressive Hints & Clues" width="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'rgba(210, 153, 34, 0.1)',
            border: '1px solid rgba(210, 153, 34, 0.3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--color-warning)',
          }}
        >
          <AlertTriangle size={16} />
          <span>
            Demonstrated autonomy rule: Unlocking each hint applies a <strong>-10 point penalty</strong> to this session's score.
          </span>
        </div>

        {hints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
            No hints are configured for this laboratory. Rely on standard command documentation (e.g. <code>--help</code> or <code>man</code>).
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hints.map((hint, idx) => {
              const isUnlocked = unlockedHintIds.has(hint.id);

              return (
                <div
                  key={hint.id}
                  style={{
                    backgroundColor: 'var(--color-bg-canvas)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={16} color={isUnlocked ? 'var(--color-warning)' : 'var(--color-text-muted)'} />
                      <span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>
                        Hint #{idx + 1}
                      </span>
                      {hint.category && (
                        <Badge variant="neutral">{hint.category}</Badge>
                      )}
                    </div>

                    <Badge variant={isUnlocked ? 'success' : 'neutral'}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>

                  {isUnlocked ? (
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {hint.text}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Hint is concealed.
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Unlock size={14} />}
                        onClick={() => onUnlockHint(hint.id)}
                      >
                        Unlock Hint (-10 pts)
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

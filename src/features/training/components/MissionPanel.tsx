import React, { useState } from 'react';
import { Target, Info, CheckSquare, Award, Lightbulb, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import type { LabDefinition, ConceptDefinition } from '../../../domain/content/schemas';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export interface MissionPanelProps {
  lab: LabDefinition;
  concepts: ConceptDefinition[];
  hintsUnlockedCount: number;
  totalHintsCount: number;
  onOpenHints: () => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  lab,
  concepts,
  hintsUnlockedCount,
  totalHintsCount,
  onOpenHints,
}) => {
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-canvas)',
        borderRight: '1px solid var(--color-border-default)',
        overflowY: 'auto',
      }}
    >
      {/* Lab Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-border-default)',
          backgroundColor: 'var(--color-bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent)', fontWeight: 700 }}>
            {lab.id}
          </span>
          <Badge
            variant={
              lab.difficulty === 'beginner'
                ? 'ready'
                : lab.difficulty === 'intermediate'
                ? 'warning'
                : 'danger'
            }
          >
            {lab.difficulty}
          </Badge>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-heading)', lineHeight: 1.3 }}>
          {lab.title}
        </h2>
      </div>

      {/* Main Mission Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {/* Objective Box */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-muted)',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Target size={14} color="var(--color-accent)" />
            <span>Mission Objective</span>
          </h4>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-panel)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--color-text-heading)',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {lab.mission.objective}
          </div>
        </div>

        {/* Context / Background */}
        {lab.mission.context && (
          <div>
            <h4
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Info size={14} color="var(--color-text-secondary)" />
              <span>Context</span>
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {lab.mission.context}
            </p>
          </div>
        )}

        {/* Step Instructions */}
        {lab.mission.instructions && lab.mission.instructions.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckSquare size={14} color="var(--color-success)" />
              <span>Instructions</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Array.isArray(lab.mission.instructions) ? lab.mission.instructions : [lab.mission.instructions]).map((inst, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      paddingTop: '2px',
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Associated Concepts */}
        {concepts.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Award size={14} color="var(--color-warning)" />
              <span>Target Concepts</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {concepts.map((concept) => {
                const isExpanded = expandedConceptId === concept.id;
                return (
                  <div
                    key={concept.id}
                    style={{
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border-muted)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setExpandedConceptId(isExpanded ? null : concept.id)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{concept.name}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          padding: '8px 10px 10px',
                          borderTop: '1px solid var(--color-border-muted)',
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        <p>{concept.summary}</p>
                        {concept.relatedCommands && concept.relatedCommands.length > 0 && (
                          <div style={{ marginTop: '6px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Commands:</span>
                            {concept.relatedCommands.map((cmd) => (
                              <code
                                key={cmd}
                                style={{
                                  fontSize: '11px',
                                  padding: '1px 4px',
                                  backgroundColor: 'var(--color-bg-canvas)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--color-accent)',
                                }}
                              >
                                {cmd}
                              </code>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {lab.prerequisites && lab.prerequisites.length > 0 && (
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Prerequisites
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              {lab.prerequisites.map((p) => (
                <Badge key={p} variant="neutral">
                  <Lock size={10} style={{ marginRight: '4px' }} />
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hints Footer Button */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border-default)',
          backgroundColor: 'var(--color-bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <Lightbulb size={16} color="var(--color-warning)" />
          <span>
            Hints: {hintsUnlockedCount} of {totalHintsCount} unlocked
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={onOpenHints}>
          {hintsUnlockedCount > 0 ? 'View Hints' : 'Get Hint'}
        </Button>
      </div>
    </div>
  );
};

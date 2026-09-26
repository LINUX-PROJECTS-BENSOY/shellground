import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import type { MasteryOverview } from '../../application/mastery/MasteryService';
import type { ConceptDefinition } from '../../domain/content/schemas';

interface ConceptCard {
  concept: ConceptDefinition;
  record?: unknown;
  score: number;
  state: string;
}

export const MasteryView: React.FC = () => {
  const { registry, masteryService, selectLab } = useAppStore();
  const [overview, setOverview] = useState<MasteryOverview | null>(null);
  const [filterState, setFilterState] = useState<string>('all');
  const [isDecaying, setIsDecaying] = useState(false);

  const concepts = registry.listConcepts();

  const loadData = async () => {
    if (!masteryService) return;
    const ov = await masteryService.getMasteryOverview();
    setOverview(ov);
    // Find all labs to discover all available concepts even if not practiced yet
  };

  useEffect(() => {
    loadData();
  }, [masteryService]);

  const handleApplyDecay = async () => {
    if (!masteryService || isDecaying) return;
    setIsDecaying(true);
    try {
      await masteryService.applyDecay();
      await loadData();
    } finally {
      setIsDecaying(false);
    }
  };

  const allConceptCards: ConceptCard[] = concepts.map((c) => {
    const rec = overview?.weakestConcepts.find((w) => w.conceptId === c.id) ??
      overview?.strongestConcepts.find((s) => s.conceptId === c.id);

    return {
      concept: c,
      record: rec,
      score: rec ? rec.score : 0,
      state: rec ? rec.state : 'unpracticed',
    };
  });

  const filteredCards = allConceptCards.filter((card) => {
    if (filterState === 'all') return true;
    return card.state === filterState;
  });

  // Find a lab teaching this concept
  const findLabForConcept = (conceptId: string) => {
    const labs = registry.listLabs('linux-foundations');
    return labs.find((l) => (l.concepts ?? []).includes(conceptId));
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Award size={20} color="var(--color-success)" />
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-heading)' }}>
              Concept Mastery & Skill Analytics
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Pure mathematical competency tracking with progressive retention decay and autonomous practice recommendations.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<RefreshCw size={14} />}
          onClick={handleApplyDecay}
          disabled={isDecaying}
          title="Applies time-based retention decay calculation"
        >
          {isDecaying ? 'Calculating...' : 'Evaluate Decay'}
        </Button>
      </div>

      {/* State Metric Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Average Competency</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            {overview ? `${Math.round(overview.averageScore * 100)}%` : '0%'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-accent)' }}>
            Across {overview?.totalTracked ?? 0} tracked concepts
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Mastered Concepts</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)', margin: '4px 0' }}>
            {overview?.byState.mastered ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            ≥ 85% fluency + blind runs
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Competent Concepts</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0' }}>
            {overview?.byState.competent ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            ≥ 70% proficiency
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Stale (Needs Review)</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-danger)', margin: '4px 0' }}>
            {overview?.byState.stale ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>
            Decayed past retention threshold
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'mastered', 'competent', 'practicing', 'stale', 'unpracticed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterState(st)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: filterState === st ? 'var(--color-accent)' : 'var(--color-border-default)',
              backgroundColor: filterState === st ? 'var(--color-accent-subtle)' : 'var(--color-bg-panel)',
              color: filterState === st ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: '12px',
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Concept Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {filteredCards.map(({ concept, score, state }) => {
          const associatedLab = findLabForConcept(concept.id);

          return (
            <div
              key={concept.id}
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {concept.id}
                  </span>
                  <Badge
                    variant={
                      state === 'mastered'
                        ? 'success'
                        : state === 'competent'
                        ? 'ready'
                        : state === 'stale'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {state}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: '4px' }}>
                  {concept.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                  {concept.summary}
                </p>

                {/* Score Progress Bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Competency</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--color-bg-panel)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(score * 100)}%`,
                        backgroundColor:
                          state === 'mastered'
                            ? 'var(--color-success)'
                            : state === 'competent'
                            ? 'var(--color-accent)'
                            : state === 'stale'
                            ? 'var(--color-danger)'
                            : 'var(--color-warning)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Commands */}
                {concept.relatedCommands && concept.relatedCommands.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {concept.relatedCommands?.map((cmd: string) => (
                      <code
                        key={cmd}
                        style={{
                          fontSize: '11px',
                          padding: '1px 5px',
                          backgroundColor: 'var(--color-bg-canvas)',
                          border: '1px solid var(--color-border-muted)',
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

              {/* Action Button */}
              {associatedLab && (
                <div style={{ borderTop: '1px solid var(--color-border-muted)', paddingTop: '10px', marginTop: '10px' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ArrowRight size={14} />}
                    onClick={() => selectLab(associatedLab.id, associatedLab.packId)}
                    style={{ width: '100%' }}
                  >
                    Practice in {associatedLab.title}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

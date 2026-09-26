import React, { useState } from 'react';
import { Search, CheckCircle2, Lock, Play, Terminal, BookOpen } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import type { LabDefinition } from '../../domain/content/schemas';

export const LabCatalogView: React.FC = () => {
  const { registry, completedLabIds, allProgress, selectLab } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const labs = registry.listLabs('linux-foundations');
  const progressMap = new Map(allProgress.map((p) => [p.labId, p]));

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.concepts ?? []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || lab.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const isLabUnlocked = (lab: LabDefinition): boolean => {
    if (!lab.prerequisites || lab.prerequisites.length === 0) return true;
    return lab.prerequisites.every((reqId) => completedLabIds.has(reqId));
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Catalog Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <BookOpen size={20} color="var(--color-accent)" />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-heading)' }}>
            Linux Foundations Curriculum Catalog
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          20 progressive, verified command-line laboratories covering navigation, stream processing, permissions, and security incident response.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            flex: 1,
            minWidth: '240px',
          }}
        >
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search labs by title, command, or concept (e.g. grep, chmod, pipes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              width: '100%',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: selectedDifficulty === diff ? 'var(--color-accent)' : 'var(--color-border-default)',
                backgroundColor: selectedDifficulty === diff ? 'var(--color-accent-subtle)' : 'var(--color-bg-panel)',
                color: selectedDifficulty === diff ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: '12px',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Lab List / Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLabs.map((lab, index) => {
          const isCompleted = completedLabIds.has(lab.id);
          const unlocked = isLabUnlocked(lab);
          const progress = progressMap.get(lab.id);

          return (
            <div
              key={lab.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid',
                borderColor: isCompleted ? 'rgba(63, 185, 80, 0.3)' : 'var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                opacity: unlocked ? 1 : 0.65,
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Left Column: Number, Title, Objective, Tags */}
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                    {lab.title}
                  </h3>
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

                  {isCompleted && (
                    <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                      Completed ({progress?.bestScore ?? 100}%)
                    </Badge>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  {lab.mission.objective}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Concepts:</span>
                    {(lab.concepts ?? []).map((c) => (
                      <span
                        key={c}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 6px',
                          backgroundColor: 'var(--color-bg-panel)',
                          border: '1px solid var(--color-border-muted)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Est: {lab.estimatedMinutes} min
                  </span>

                  {!unlocked && (
                    <span style={{ fontSize: '11px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Requires: {(lab.prerequisites ?? []).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Launch Action */}
              <div>
                {unlocked ? (
                  <Button
                    variant={isCompleted ? 'secondary' : 'primary'}
                    icon={isCompleted ? <Terminal size={14} /> : <Play size={14} />}
                    onClick={() => selectLab(lab.id, 'linux-foundations')}
                  >
                    {isCompleted ? 'Practice Again' : 'Start Lab'}
                  </Button>
                ) : (
                  <Button disabled variant="secondary" icon={<Lock size={14} />}>
                    Locked
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredLabs.length === 0 && (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No laboratories found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};

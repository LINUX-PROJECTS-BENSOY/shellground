import React, { useEffect, useState } from 'react';
import { Play, BookOpen, Award, AlertCircle, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import type { LabRecommendation } from '../../application/recommendations/RecommendationService';
import type { MasteryOverview } from '../../application/mastery/MasteryService';

export const DashboardView: React.FC = () => {
  const {
    registry,
    recommendationService,
    masteryService,
    telemetryService,
    completedLabIds,
    selectLab,
    setCurrentView,
    allProgress,
  } = useAppStore();

  const [recommendations, setRecommendations] = useState<LabRecommendation[]>([]);
  const [masteryOverview, setMasteryOverview] = useState<MasteryOverview | null>(null);
  const [totalCommands, setTotalCommands] = useState<number>(0);

  const totalLabs = registry.listLabs('linux-foundations').length || 20;
  const completedCount = completedLabIds.size;
  const percentComplete = Math.round((completedCount / totalLabs) * 100);

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      if (recommendationService) {
        const recs = await recommendationService.getRecommendations(3);
        if (mounted) setRecommendations(recs);
      }
      if (masteryService) {
        const overview = await masteryService.getMasteryOverview();
        if (mounted) setMasteryOverview(overview);
      }
      if (telemetryService) {
        const report = await telemetryService.generateTelemetryReport();
        if (mounted) setTotalCommands(report.totalCommandsExecuted);
      }
    };
    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [recommendationService, masteryService, telemetryService, completedLabIds]);

  const topRecommendation = recommendations[0];
  const nextLab = topRecommendation ? registry.getLab('linux-foundations', topRecommendation.labId) : undefined;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Welcome & Overview Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-heading)', marginBottom: '6px' }}>
          Terminal Readiness & Training Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Real client-side Linux command fluency. Zero mandatory servers, zero simulated shortcuts.
        </p>
      </div>

      {/* Primary Action Card: Resume Training */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent)', fontWeight: 700 }}>
              Curriculum Track
            </span>
            <Badge variant="isolated">Linux Foundations</Badge>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: '8px' }}>
            {nextLab ? nextLab.title : 'Linux Foundations Completed!'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            {nextLab ? nextLab.mission.objective : 'All 20 foundational labs completed. Great work!'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Progress: {completedCount} / {totalLabs} labs ({percentComplete}%)</span>
            <span>Difficulty: {nextLab?.difficulty ?? 'Beginner'}</span>
            <span>Est: {nextLab?.estimatedMinutes ?? 5} min</span>
          </div>
        </div>

        <div>
          {nextLab ? (
            <Button
              variant="primary"
              size="lg"
              icon={<Play size={16} />}
              onClick={() => selectLab(nextLab.id, 'linux-foundations')}
            >
              {completedCount === 0 ? 'Start Training' : 'Resume Training'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              icon={<RotateCcw size={16} />}
              onClick={() => selectLab('001-where-am-i', 'linux-foundations')}
            >
              Review Labs
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Curriculum Completion</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            {percentComplete}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-success)' }}>
            {completedCount} of {totalLabs} labs verified
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Average Mastery Score</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            {masteryOverview ? `${Math.round(masteryOverview.averageScore * 100)}%` : '0%'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-accent)' }}>
            {masteryOverview ? `${masteryOverview.byState.mastered + masteryOverview.byState.competent} concepts fluent` : '19 total concepts'}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Commands Executed</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            {totalCommands}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Recorded in local telemetry
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-panel)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Active Sandbox</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            WASIX
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-success)' }}>
            Deterministic Client-Side
          </span>
        </div>
      </div>

      {/* Two Column Grid: Recommendations & Weak Areas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Next Recommended Labs */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--color-accent)" />
              <span>Recommended Next Steps</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('catalog')}>
              View All 20 ↗
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendations.slice(0, 3).map((rec) => {
              const lab = registry.getLab('linux-foundations', rec.labId);
              if (!lab) return null;
              return (
                <div
                  key={rec.labId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-bg-canvas)',
                    border: '1px solid var(--color-border-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {lab.title}
                      </span>
                      {rec.reason === 'weak-concept' && (
                        <Badge variant="warning">Focus Area</Badge>
                      )}
                      {rec.reason === 'stale-review' && (
                        <Badge variant="danger">Review</Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {rec.rationale}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ArrowRight size={14} />}
                    onClick={() => selectLab(lab.id, 'linux-foundations')}
                  >
                    Open
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mastery Diagnostics Snapshot */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="var(--color-success)" />
              <span>Concept Competency Status</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('mastery')}>
              Details ↗
            </Button>
          </div>

          {masteryOverview && masteryOverview.totalTracked > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-success)' }}>Mastered: {masteryOverview.byState.mastered}</span>
                <span style={{ color: 'var(--color-accent)' }}>Competent: {masteryOverview.byState.competent}</span>
                <span style={{ color: 'var(--color-warning)' }}>Practicing: {masteryOverview.byState.practicing}</span>
                <span style={{ color: 'var(--color-danger)' }}>Stale: {masteryOverview.byState.stale}</span>
              </div>

              {masteryOverview.weakestConcepts.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Weakest Concepts Needing Practice
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {masteryOverview.weakestConcepts.slice(0, 3).map((w) => (
                      <Badge key={w.conceptId} variant="warning">
                        {w.conceptId}: {Math.round(w.score * 100)}%
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <AlertCircle size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p>No competency telemetry recorded yet.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Complete your first lab to initialize mastery tracking.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: '12px' }}>
          Recent Lab Attempts
        </h3>

        {allProgress.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allProgress.slice(0, 5).map((p) => {
              const lab = registry.getLab(p.packId, p.labId);
              return (
                <div
                  key={p.labKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-bg-canvas)',
                    border: '1px solid var(--color-border-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.status === 'completed' ? (
                      <CheckCircle2 size={16} color="var(--color-success)" />
                    ) : (
                      <AlertCircle size={16} color="var(--color-warning)" />
                    )}
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {lab?.title ?? p.labId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Score: {p.bestScore}%</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Attempts: {p.attempts}</span>
                    <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            No lab sessions recorded yet. Launch a lab from the catalog or click "Start Training" above.
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';

interface SkillMetric {
  name: string;
  category: string;
  score: number; // 0 - 100
  description: string;
}

const SKILL_METRICS: SkillMetric[] = [
  { name: 'Navigation', category: 'FS', score: 94, description: 'pwd, cd, ls, absolute & relative path resolution' },
  { name: 'File Ops', category: 'IO', score: 88, description: 'touch, cp, mv, rm, mkdir, tree traversal' },
  { name: 'Permissions', category: 'SEC', score: 78, description: 'chmod octal/symbolic, chown, sticky bits' },
  { name: 'Pipes & Redir', category: 'STREAM', score: 85, description: '|, 2>, >>, stderr, stdout byte routing' },
  { name: 'Text Filtering', category: 'PARSE', score: 82, description: 'grep, awk, sed, sort, uniq, cut pipelines' },
  { name: 'Process Mgmt', category: 'PROC', score: 75, description: 'ps, kill, bg, fg, jobs, signal handling' },
  { name: 'Arch & Config', category: 'SYS', score: 90, description: 'uname, env, PATH, .bashrc customization' },
  { name: 'Automation', category: 'CRON', score: 70, description: 'crontab, bash loops, shell conditionals' },
];

export const InteractiveRadarChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const size = 300;
  const center = size / 2;
  const radius = center - 40;
  const total = SKILL_METRICS.length;

  // Calculate polygon points
  const points = SKILL_METRICS.map((metric, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const r = (metric.score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, metric };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  const activeMetric = hoveredIdx !== null ? SKILL_METRICS[hoveredIdx] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: 'rgba(15, 20, 30, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600 }}>
          LIVE SKILL MATRIX
        </span>
        <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0 0' }}>
          8-Vector Linux Competency Radar
        </h4>
      </div>

      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Concentric grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray={scale === 1 ? 'none' : '3 3'}
          />
        ))}

        {/* Spoke axes */}
        {SKILL_METRICS.map((_, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon with cyan glow */}
        <polygon
          points={polygonPath}
          fill="rgba(56, 189, 248, 0.2)"
          stroke="#00f0ff"
          strokeWidth="2.5"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Interactive vertex points */}
        {points.map((pt, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 4}
                fill={isHovered ? '#34d399' : '#00f0ff'}
                stroke="#080b10"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}

        {/* Axis Labels */}
        {SKILL_METRICS.map((metric, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelDist = radius + 20;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          const isHovered = hoveredIdx === i;

          return (
            <text
              key={metric.name}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHovered ? '#00f0ff' : 'var(--color-text-secondary)'}
              fontSize={isHovered ? '11px' : '10px'}
              fontWeight={isHovered ? 700 : 500}
              fontFamily="var(--font-mono)"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {metric.name}
            </text>
          );
        })}
      </svg>

      {/* Dynamic Skill Details readout */}
      <div
        style={{
          marginTop: '16px',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          padding: '12px 16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          minHeight: '60px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {activeMetric ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ color: '#00f0ff', fontWeight: 700, fontSize: '13px' }}>
                {activeMetric.name} ({activeMetric.category})
              </span>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
                {activeMetric.score}% Mastery
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {activeMetric.description}
            </p>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Hover over any vector point to view competency score and skill coverage.
          </span>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { Badge } from '../../shared/components/Badge';
import type { FidelityTelemetryReport } from '../../application/diagnostics/FidelityTelemetryService';

export const DiagnosticsView: React.FC = () => {
  const { telemetryService } = useAppStore();
  const [report, setReport] = useState<FidelityTelemetryReport | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadReport = async () => {
      if (telemetryService) {
        const rep = await telemetryService.generateTelemetryReport();
        if (mounted) setReport(rep);
      }
    };
    loadReport();
    return () => {
      mounted = false;
    };
  }, [telemetryService]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Diagnostics Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Activity size={20} color="var(--color-accent)" />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-heading)' }}>
            Command Fidelity & Execution Diagnostics
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Transparent command telemetry classifying client-side execution fidelity, error frequencies, and package sources.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Total Executions</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-heading)', margin: '4px 0' }}>
            {report?.totalCommandsExecuted ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {report?.uniqueCommands ?? 0} unique binaries invoked
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Native WASIX Fidelity</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)', margin: '4px 0' }}>
            {report?.fidelityDistribution.nativeWasix ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            100% genuine POSIX execution
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Simulated Commands</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#bc8cff', margin: '4px 0' }}>
            {report?.fidelityDistribution.simulated ?? 0}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Client-side mock fallback
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Overall Failure Rate</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: (report?.overallFailureRate ?? 0) > 0.3 ? 'var(--color-warning)' : 'var(--color-success)', margin: '4px 0' }}>
            {report ? `${Math.round(report.overallFailureRate * 100)}%` : '0%'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Non-zero exit code ratio
          </span>
        </div>
      </div>

      {/* Warnings & Remediation Banner */}
      {report && report.highFailureWarnings.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(210, 153, 34, 0.1)',
            border: '1px solid rgba(210, 153, 34, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Command Execution Friction Warnings</h3>
          </div>
          <ul style={{ margin: '0 0 0 20px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
            {report.highFailureWarnings.map((warn, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Command Usage Table */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border-default)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
            Command Invocations & Fidelity Classification
          </h3>
        </div>

        {report && report.commandStats.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-canvas)', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Command</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Fidelity</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Invocations</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Success / Fail</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Failure Rate</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>Package Source</th>
              </tr>
            </thead>
            <tbody>
              {report.commandStats.map((stat) => (
                <tr
                  key={stat.command}
                  style={{ borderBottom: '1px solid var(--color-border-muted)', color: 'var(--color-text-primary)' }}
                >
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {stat.command}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Badge variant={stat.fidelity === 'native-wasix' ? 'real' : stat.fidelity === 'simulated' ? 'simulated' : 'unsupported'}>
                      {stat.fidelity}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)' }}>
                    {stat.invocations}
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--color-success)' }}>{stat.successCount}</span> / <span style={{ color: stat.failureCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{stat.failureCount}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(stat.failureRate * 100)}%
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                    {stat.packageSource ?? 'n/a'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No commands executed in this session yet. Launch a lab or playground to record diagnostics.
          </div>
        )}
      </div>
    </div>
  );
};

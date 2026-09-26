import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, ShieldCheck, Database, Check } from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { APP_CONFIG } from '../../app/config/app-config';
import { detectBrowserCapabilities } from '../../domain/runtime/RuntimeCapability';

export const SettingsView: React.FC = () => {
  const { backupService, repositories, refreshProgress } = useAppStore();
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);

  const capabilities = detectBrowserCapabilities();

  const handleExportBackup = async () => {
    if (!backupService) {
      alert('Backup service is only available with IndexedDB storage.');
      return;
    }
    try {
      const backupJson = JSON.stringify(await backupService.exportBackup(), null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shellground-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !backupService) return;

    try {
      const text = await file.text();
      const res = await backupService.restoreBackup(text);
      if (res.success) {
        setImportMessage(`Restored successfully: ${res.importedRecords} records imported.`);
        await refreshProgress();
      } else {
        setImportMessage(`Restore failed: ${res.error ?? 'Validation failed'}`);
      }
    } catch (err) {
      setImportMessage(`Restore failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleWipeData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently reset all lab completions, concept mastery, and command history? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsWiping(true);
    try {
      if (repositories?.database) {
        await Promise.all([
          repositories.database.labProgress.clear(),
          repositories.database.commandHistory.clear(),
          repositories.database.conceptMastery.clear(),
          repositories.database.settings.clear(),
          repositories.database.sessions.clear(),
        ]);
      } else if (repositories) {
        await repositories.commandHistory.clear();
      }
      await refreshProgress();
      alert('All local training data has been reset.');
    } catch (err) {
      alert(`Wipe failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <SettingsIcon size={20} color="var(--color-accent)" />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-heading)' }}>
            System Settings & Local Persistence
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Manage local IndexedDB storage, export disaster-recovery backups, and inspect runtime capabilities.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Local Storage & Backup Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database size={16} color="var(--color-accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
              Local-First Persistence & Backups
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            All progress, scores, and command history are stored purely in your browser's local IndexedDB. No learner data is ever transmitted to a cloud server.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="secondary"
              icon={exportSuccess ? <Check size={14} color="var(--color-success)" /> : <Download size={14} />}
              onClick={handleExportBackup}
            >
              {exportSuccess ? 'Backup Exported!' : 'Export JSON Backup'}
            </Button>

            <label style={{ display: 'inline-flex' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-panel)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} />
                <span>Restore JSON Backup</span>
              </span>
            </label>
          </div>

          {importMessage && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-accent)' }}>
              {importMessage}
            </div>
          )}
        </div>

        {/* Runtime Diagnostics Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={16} color="var(--color-success)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-heading)' }}>
              Client Sandbox Compatibility
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Web Workers:</span>
              <Badge variant={capabilities.webWorkers ? 'success' : 'danger'}>
                {capabilities.webWorkers ? 'Supported' : 'Missing'}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>WebAssembly:</span>
              <Badge variant={capabilities.webAssembly ? 'success' : 'danger'}>
                {capabilities.webAssembly ? 'Supported' : 'Missing'}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Cross-Origin Isolation:</span>
              <Badge variant={capabilities.crossOriginIsolated ? 'success' : 'warning'}>
                {capabilities.crossOriginIsolated ? 'Active' : 'Optional'}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Storage Mode:</span>
              <Badge variant={repositories?.isFallback ? 'warning' : 'success'}>
                {repositories?.isFallback ? 'In-Memory Fallback' : 'Dexie IndexedDB'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            backgroundColor: 'rgba(248, 81, 73, 0.05)',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '8px' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
            Permanently delete all locally recorded laboratory attempts, concept competency scores, and telemetry.
          </p>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={handleWipeData}
            disabled={isWiping}
          >
            {isWiping ? 'Wiping...' : 'Reset All Local Progress'}
          </Button>
        </div>

        {/* App Info Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', paddingTop: '12px' }}>
          <span>{APP_CONFIG.appName} v{APP_CONFIG.appVersion} — Local-first browser training environment</span>
        </div>
      </div>
    </div>
  );
};

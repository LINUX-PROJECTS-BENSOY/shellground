import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShellgroundDatabase } from '../../../src/infrastructure/persistence/ShellgroundDatabase';
import { BackupService } from '../../../src/infrastructure/persistence/backup/BackupService';

describe('BackupService', () => {
  let db: ShellgroundDatabase;
  let backupService: BackupService;

  beforeEach(() => {
    db = new ShellgroundDatabase(`test_backup_${Date.now()}_${Math.random()}`);
    backupService = new BackupService(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('exports state to a validated backup object and restores it accurately', async () => {
    // 1. Seed some initial data
    await db.labProgress.put({
      labKey: 'pack.1::lab.1::v1',
      labId: 'lab.1',
      labVersion: 1,
      packId: 'pack.1',
      packVersion: '0.1.0',
      status: 'completed',
      attempts: 2,
      completions: 1,
      bestScore: 90,
    });

    await db.settings.put({
      key: 'ui.theme',
      value: 'high-contrast',
      updatedAt: new Date().toISOString(),
    });

    // 2. Export backup
    const backup = await backupService.exportBackup();
    expect(backup.app).toBe('shellground');
    expect(backup.schemaVersion).toBe(1);
    expect(backup.tables.labProgress).toHaveLength(1);
    expect(backup.tables.settings).toHaveLength(1);

    // 3. Clear database to simulate clean state
    await db.labProgress.clear();
    await db.settings.clear();
    expect(await db.labProgress.count()).toBe(0);

    // 4. Restore from backup
    const restoreResult = await backupService.restoreBackup(backup);
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.importedRecords).toBe(2);

    // 5. Verify restored data
    const restoredProgress = await db.labProgress.get('pack.1::lab.1::v1');
    expect(restoredProgress?.status).toBe('completed');
    expect(restoredProgress?.bestScore).toBe(90);

    const restoredTheme = await db.settings.get('ui.theme');
    expect(restoredTheme?.value).toBe('high-contrast');
  });

  it('rejects invalid or corrupted backup payloads', async () => {
    const corruptedBackup = {
      app: 'wrong-app',
      schemaVersion: 999,
      tables: {},
    };

    const result = await backupService.restoreBackup(corruptedBackup);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Backup validation failed');
  });
});

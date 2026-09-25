import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShellgroundDatabase } from '../../../src/infrastructure/persistence/ShellgroundDatabase';
import { DexieLabProgressRepository } from '../../../src/infrastructure/persistence/repositories/dexie/DexieLabProgressRepository';
import { DexieCommandHistoryRepository } from '../../../src/infrastructure/persistence/repositories/dexie/DexieCommandHistoryRepository';
import { DexieConceptMasteryRepository } from '../../../src/infrastructure/persistence/repositories/dexie/DexieConceptMasteryRepository';
import { DexieSettingsRepository } from '../../../src/infrastructure/persistence/repositories/dexie/DexieSettingsRepository';

describe('Dexie Repositories', () => {
  let db: ShellgroundDatabase;
  let labRepo: DexieLabProgressRepository;
  let cmdRepo: DexieCommandHistoryRepository;
  let masteryRepo: DexieConceptMasteryRepository;
  let settingsRepo: DexieSettingsRepository;

  beforeEach(() => {
    db = new ShellgroundDatabase(`test_db_${Date.now()}_${Math.random()}`);
    labRepo = new DexieLabProgressRepository(db);
    cmdRepo = new DexieCommandHistoryRepository(db);
    masteryRepo = new DexieConceptMasteryRepository(db);
    settingsRepo = new DexieSettingsRepository(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('DexieLabProgressRepository', () => {
    it('creates and updates lab attempt and completion records', async () => {
      const key = 'pack.linux::lab.pwd::v1';

      // 1. Initial attempt
      const attempt = await labRepo.recordAttempt(key, {
        labId: 'lab.pwd',
        labVersion: 1,
        packId: 'pack.linux',
        packVersion: '0.1.0',
        mode: 'guided',
      });

      expect(attempt.status).toBe('in-progress');
      expect(attempt.attempts).toBe(1);
      expect(attempt.completions).toBe(0);

      // 2. Second attempt
      const attempt2 = await labRepo.recordAttempt(key, {
        labId: 'lab.pwd',
        labVersion: 1,
        packId: 'pack.linux',
        packVersion: '0.1.0',
      });
      expect(attempt2.attempts).toBe(2);

      // 3. Completion
      const completed = await labRepo.recordCompletion(key, {
        score: 100,
        durationMs: 45000,
        hintsUsed: 0,
      });

      expect(completed.status).toBe('completed');
      expect(completed.completions).toBe(1);
      expect(completed.bestScore).toBe(100);
      expect(completed.bestDurationMs).toBe(45000);

      // 4. Query by pack
      const packLabs = await labRepo.getByPack('pack.linux');
      expect(packLabs).toHaveLength(1);
      expect(packLabs[0]?.labKey).toBe(key);
    });
  });

  describe('DexieCommandHistoryRepository', () => {
    it('appends and queries commands by lab and recency', async () => {
      await cmdRepo.add({
        commandLine: 'pwd',
        labId: 'lab.pwd',
        exitCode: 0,
        timestamp: new Date().toISOString(),
      });

      await cmdRepo.add({
        commandLine: 'ls -la',
        labId: 'lab.pwd',
        exitCode: 0,
        timestamp: new Date().toISOString(),
      });

      const labCommands = await cmdRepo.getByLab('lab.pwd');
      expect(labCommands).toHaveLength(2);
      expect(labCommands[0]?.commandLine).toBe('pwd');

      const recent = await cmdRepo.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0]?.commandLine).toBe('ls -la');
    });
  });

  describe('DexieConceptMasteryRepository', () => {
    it('saves and retrieves concept mastery records', async () => {
      await masteryRepo.save({
        conceptId: 'concept.cwd',
        state: 'practicing',
        score: 0.5,
        encounters: 3,
        successes: 2,
        failures: 1,
        guidedSuccesses: 2,
        blindSuccesses: 0,
        hintsUsed: 1,
        updatedAt: new Date().toISOString(),
      });

      const record = await masteryRepo.get('concept.cwd');
      expect(record).toBeDefined();
      expect(record?.score).toBe(0.5);
      expect(record?.state).toBe('practicing');

      const all = await masteryRepo.getAll();
      expect(all).toHaveLength(1);
    });
  });

  describe('DexieSettingsRepository', () => {
    it('manages key-value settings with default fallback and deletions', async () => {
      const defaultTheme = await settingsRepo.get('ui.theme', 'dark');
      expect(defaultTheme).toBe('dark');

      await settingsRepo.set('ui.theme', 'high-contrast');
      const updatedTheme = await settingsRepo.get('ui.theme');
      expect(updatedTheme).toBe('high-contrast');

      await settingsRepo.set('terminal.fontSize', 16);
      const all = await settingsRepo.getAll();
      expect(all['ui.theme']).toBe('high-contrast');
      expect(all['terminal.fontSize']).toBe(16);

      await settingsRepo.delete('ui.theme');
      const postDelete = await settingsRepo.get('ui.theme');
      expect(postDelete).toBeUndefined();
    });
  });
});

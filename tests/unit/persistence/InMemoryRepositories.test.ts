import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryLabProgressRepository,
  InMemoryCommandHistoryRepository,
  InMemoryConceptMasteryRepository,
  InMemorySettingsRepository,
} from '../../../src/infrastructure/persistence/repositories/memory/InMemoryRepositories';

describe('In-Memory Fallback Repositories', () => {
  let labRepo: InMemoryLabProgressRepository;
  let cmdRepo: InMemoryCommandHistoryRepository;
  let masteryRepo: InMemoryConceptMasteryRepository;
  let settingsRepo: InMemorySettingsRepository;

  beforeEach(() => {
    labRepo = new InMemoryLabProgressRepository();
    cmdRepo = new InMemoryCommandHistoryRepository();
    masteryRepo = new InMemoryConceptMasteryRepository();
    settingsRepo = new InMemorySettingsRepository();
  });

  it('manages lab progress entirely in memory', async () => {
    const key = 'pack.1::lab.1::v1';

    await labRepo.recordAttempt(key, {
      labId: 'lab.1',
      labVersion: 1,
      packId: 'pack.1',
      packVersion: '0.1.0',
    });

    const inProgress = await labRepo.get(key);
    expect(inProgress?.status).toBe('in-progress');

    await labRepo.recordCompletion(key, { score: 95 });
    const completed = await labRepo.get(key);
    expect(completed?.status).toBe('completed');
    expect(completed?.bestScore).toBe(95);

    const all = await labRepo.getAll();
    expect(all).toHaveLength(1);
  });

  it('records commands and limits recent command retrieval', async () => {
    await cmdRepo.add({ commandLine: 'echo 1', timestamp: new Date().toISOString() });
    await cmdRepo.add({ commandLine: 'echo 2', timestamp: new Date().toISOString() });

    const recent = await cmdRepo.getRecent(1);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.commandLine).toBe('echo 2');

    await cmdRepo.clear();
    const cleared = await cmdRepo.getRecent();
    expect(cleared).toHaveLength(0);
  });

  it('manages concept mastery and settings', async () => {
    await masteryRepo.save({
      conceptId: 'concept.files',
      state: 'mastered',
      score: 1.0,
      encounters: 5,
      successes: 5,
      failures: 0,
      guidedSuccesses: 2,
      blindSuccesses: 3,
      hintsUsed: 0,
      updatedAt: new Date().toISOString(),
    });

    const mastery = await masteryRepo.get('concept.files');
    expect(mastery?.score).toBe(1.0);

    await settingsRepo.set('theme', 'dark');
    expect(await settingsRepo.get('theme')).toBe('dark');
  });
});

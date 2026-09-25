import { describe, it, expect, beforeEach } from 'vitest';
import type { LabDefinition } from '../../../src/domain/content/schemas';
import {
  InMemoryLabProgressRepository,
  InMemoryCommandHistoryRepository,
} from '../../../src/infrastructure/persistence/repositories/memory/InMemoryRepositories';
import { ProgressService } from '../../../src/application/progress/ProgressService';

describe('ProgressService', () => {
  let labRepo: InMemoryLabProgressRepository;
  let cmdRepo: InMemoryCommandHistoryRepository;
  let service: ProgressService;

  const sampleLab: LabDefinition = {
    schemaVersion: 1,
    id: 'lab.001',
    version: 1,
    packId: 'pack.linux-foundations',
    title: 'Where Am I?',
    difficulty: 'beginner',
    mission: { objective: 'Run pwd' },
    concepts: ['concept.cwd'],
    fixture: { id: 'fix.default', version: 1 },
    validators: [],
  };

  beforeEach(() => {
    labRepo = new InMemoryLabProgressRepository();
    cmdRepo = new InMemoryCommandHistoryRepository();
    service = new ProgressService(labRepo, cmdRepo);
  });

  it('tracks lab attempts, completions, and generates accurate composite keys', async () => {
    const key = service.getLabKey(sampleLab);
    expect(key).toBe('pack.linux-foundations::lab.001::v1');

    // Start lab
    const attempt = await service.startLab(sampleLab, 'guided');
    expect(attempt.status).toBe('in-progress');
    expect(attempt.attempts).toBe(1);

    // Complete lab
    const completed = await service.completeLab(sampleLab, {
      score: 100,
      durationMs: 30000,
      hintsUsed: 0,
    });
    expect(completed.status).toBe('completed');
    expect(completed.bestScore).toBe(100);

    // Query status
    const retrieved = await service.getLabProgress(sampleLab);
    expect(retrieved?.status).toBe('completed');
  });

  it('logs learner terminal commands and calculates progress summary statistics', async () => {
    await service.logCommand('pwd', sampleLab.id, 0, 15);
    const recent = await cmdRepo.getRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0]?.commandLine).toBe('pwd');

    // Complete sample lab
    await service.startLab(sampleLab);
    await service.completeLab(sampleLab);

    const overall = await service.getOverallSummary();
    expect(overall.totalLabsStarted).toBe(1);
    expect(overall.totalLabsCompleted).toBe(1);
    expect(overall.completionRate).toBe(1);

    const packProgress = await service.getPackProgress('pack.linux-foundations');
    expect(packProgress.totalCompleted).toBe(1);
    expect(packProgress.completionRate).toBe(1);
  });
});

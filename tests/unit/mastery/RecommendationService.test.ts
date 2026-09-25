import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationService } from '../../../src/application/recommendations/RecommendationService';
import {
  InMemoryLabProgressRepository,
  InMemoryConceptMasteryRepository,
} from '../../../src/infrastructure/persistence/repositories/memory/InMemoryRepositories';
import type { LabDefinition } from '../../../src/domain/content/schemas';

describe('RecommendationService Application Unit Tests', () => {
  let progressRepo: InMemoryLabProgressRepository;
  let masteryRepo: InMemoryConceptMasteryRepository;
  let sampleLabs: LabDefinition[];

  beforeEach(() => {
    progressRepo = new InMemoryLabProgressRepository();
    masteryRepo = new InMemoryConceptMasteryRepository();

    sampleLabs = [
      {
        id: 'lab-01-pwd',
        version: 1,
        packId: 'linux-foundations',
        title: 'Where Am I?',
        difficulty: 'beginner',
        mission: { objective: 'Print working directory' },
        concepts: ['concept.pwd'],
        prerequisites: [],
        fixture: { id: 'default-workspace' },
        validators: [],
      },
      {
        id: 'lab-02-ls',
        version: 1,
        packId: 'linux-foundations',
        title: 'Listing Files',
        difficulty: 'beginner',
        mission: { objective: 'List files with ls' },
        concepts: ['concept.ls'],
        prerequisites: ['lab-01-pwd'],
        fixture: { id: 'default-workspace' },
        validators: [],
      },
      {
        id: 'lab-03-cat',
        version: 1,
        packId: 'linux-foundations',
        title: 'Reading Files',
        difficulty: 'beginner',
        mission: { objective: 'Inspect file content with cat' },
        concepts: ['concept.cat'],
        prerequisites: ['lab-02-ls'],
        fixture: { id: 'default-workspace' },
        validators: [],
      },
    ];
  });

  it('recommends the first available lab when learner has no progress', async () => {
    const service = new RecommendationService(progressRepo, masteryRepo, sampleLabs);
    const recs = await service.getRecommendations(2);

    expect(recs).toHaveLength(1);
    expect(recs[0]?.labId).toBe('lab-01-pwd');
    expect(recs[0]?.reason).toBe('curriculum-next');
  });

  it('filters out labs whose prerequisites are not yet completed', async () => {
    const service = new RecommendationService(progressRepo, masteryRepo, sampleLabs);
    const recs = await service.getRecommendations(5);

    // lab-02 and lab-03 have unmet prerequisites, so only lab-01 should be recommended
    const ids = recs.map((r) => r.labId);
    expect(ids).toContain('lab-01-pwd');
    expect(ids).not.toContain('lab-02-ls');
    expect(ids).not.toContain('lab-03-cat');
  });

  it('prioritizes uncompleted labs that teach weak concepts', async () => {
    // Complete lab-01
    await progressRepo.save({
      labKey: 'linux-foundations::lab-01-pwd::v1',
      labId: 'lab-01-pwd',
      labVersion: 1,
      packId: 'linux-foundations',
      packVersion: '0.1.0',
      status: 'completed',
      attempts: 1,
      completions: 1,
      bestScore: 100,
    });

    // Mark concept.ls as weak (score = 0.3)
    await masteryRepo.save({
      conceptId: 'concept.ls',
      state: 'practicing',
      score: 0.3,
      encounters: 2,
      successes: 1,
      failures: 1,
      guidedSuccesses: 1,
      blindSuccesses: 0,
      hintsUsed: 2,
      updatedAt: new Date().toISOString(),
    });

    const service = new RecommendationService(progressRepo, masteryRepo, sampleLabs);
    const recs = await service.getRecommendations(2);

    expect(recs).toHaveLength(1);
    expect(recs[0]?.labId).toBe('lab-02-ls');
    expect(recs[0]?.reason).toBe('weak-concept');
    expect(recs[0]?.targetConceptId).toBe('concept.ls');
  });

  it('recommends reviewing completed labs when concept has become stale', async () => {
    // Complete both lab-01 and lab-02
    await progressRepo.save({
      labKey: 'linux-foundations::lab-01-pwd::v1',
      labId: 'lab-01-pwd',
      labVersion: 1,
      packId: 'linux-foundations',
      packVersion: '0.1.0',
      status: 'completed',
      attempts: 1,
      completions: 1,
      bestScore: 100,
    });
    await progressRepo.save({
      labKey: 'linux-foundations::lab-02-ls::v1',
      labId: 'lab-02-ls',
      labVersion: 1,
      packId: 'linux-foundations',
      packVersion: '0.1.0',
      status: 'completed',
      attempts: 1,
      completions: 1,
      bestScore: 100,
    });

    // Mark concept.pwd as stale
    await masteryRepo.save({
      conceptId: 'concept.pwd',
      state: 'stale',
      score: 0.45,
      encounters: 4,
      successes: 4,
      failures: 0,
      guidedSuccesses: 3,
      blindSuccesses: 1,
      hintsUsed: 0,
      lastPracticedAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    const service = new RecommendationService(progressRepo, masteryRepo, sampleLabs);
    const recs = await service.getRecommendations(5);

    const staleReviewRec = recs.find((r) => r.reason === 'stale-review');
    expect(staleReviewRec).toBeDefined();
    expect(staleReviewRec?.labId).toBe('lab-01-pwd');
    expect(staleReviewRec?.targetConceptId).toBe('concept.pwd');
  });
});

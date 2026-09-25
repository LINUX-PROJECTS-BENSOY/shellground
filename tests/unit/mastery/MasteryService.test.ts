import { describe, it, expect, beforeEach } from 'vitest';
import { MasteryService } from '../../../src/application/mastery/MasteryService';
import { InMemoryConceptMasteryRepository } from '../../../src/infrastructure/persistence/repositories/memory/InMemoryRepositories';

describe('MasteryService Application Unit Tests', () => {
  let repo: InMemoryConceptMasteryRepository;
  let service: MasteryService;

  beforeEach(() => {
    repo = new InMemoryConceptMasteryRepository();
    service = new MasteryService(repo);
  });

  it('records lab outcome and updates multiple concept records', async () => {
    const updated = await service.recordLabOutcome(
      ['concept.pwd', 'concept.fs-traversal'],
      {
        completed: true,
        hintsUsed: 0,
        attempts: 1,
        errorCount: 0,
        mode: 'guided',
      }
    );

    expect(updated).toHaveLength(2);
    expect(updated[0]?.conceptId).toBe('concept.pwd');
    expect(updated[0]?.score).toBe(1.0);
    expect(updated[1]?.conceptId).toBe('concept.fs-traversal');
    expect(updated[1]?.score).toBe(1.0);

    const fromRepo = await repo.get('concept.pwd');
    expect(fromRepo).toBeDefined();
    expect(fromRepo?.encounters).toBe(1);
  });

  it('applies time decay and updates stored repository records', async () => {
    await repo.save({
      conceptId: 'concept.grep',
      state: 'competent',
      score: 0.9,
      encounters: 4,
      successes: 4,
      failures: 0,
      guidedSuccesses: 3,
      blindSuccesses: 1,
      hintsUsed: 0,
      lastPracticedAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });

    // Run decay as of late September (approx 8 weeks later)
    const decayed = await service.applyDecay(new Date('2026-09-26T00:00:00.000Z'));
    expect(decayed).toHaveLength(1);
    expect(decayed[0]?.score).toBeLessThan(0.70);
    expect(decayed[0]?.state).toBe('stale');

    const saved = await repo.get('concept.grep');
    expect(saved?.state).toBe('stale');
  });

  it('generates a comprehensive mastery overview with weakest and strongest concepts', async () => {
    await repo.save({
      conceptId: 'concept.weak',
      state: 'practicing',
      score: 0.35,
      encounters: 2,
      successes: 1,
      failures: 1,
      guidedSuccesses: 1,
      blindSuccesses: 0,
      hintsUsed: 3,
      updatedAt: new Date().toISOString(),
    });

    await repo.save({
      conceptId: 'concept.strong',
      state: 'mastered',
      score: 0.95,
      encounters: 8,
      successes: 8,
      failures: 0,
      guidedSuccesses: 4,
      blindSuccesses: 4,
      hintsUsed: 0,
      updatedAt: new Date().toISOString(),
    });

    const overview = await service.getMasteryOverview();
    expect(overview.totalTracked).toBe(2);
    expect(overview.byState.practicing).toBe(1);
    expect(overview.byState.mastered).toBe(1);
    expect(overview.averageScore).toBe(0.65);
    expect(overview.weakestConcepts[0]?.conceptId).toBe('concept.weak');
    expect(overview.strongestConcepts[0]?.conceptId).toBe('concept.strong');
  });
});

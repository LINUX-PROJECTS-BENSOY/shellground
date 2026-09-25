import { describe, it, expect } from 'vitest';
import { calculateConceptDecay, calculateReviewUrgency } from '../../../src/domain/mastery/decay';
import type { MasteryRecord } from '../../../src/domain/mastery/MasteryRecord';

describe('Sub-Phase 8.2: Concept Decay & Spaced Repetition', () => {
  const baseRecord: MasteryRecord = {
    conceptId: 'concept.file-ops',
    state: 'competent',
    score: 0.85,
    encounters: 5,
    successes: 4,
    failures: 1,
    guidedSuccesses: 3,
    blindSuccesses: 1,
    hintsUsed: 1,
    lastPracticedAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };

  it('leaves unseen or unpracticed concepts undecayed', () => {
    const unseen: MasteryRecord = {
      ...baseRecord,
      state: 'unseen',
      lastPracticedAt: undefined,
    };
    const result = calculateConceptDecay(unseen, new Date('2026-09-26T00:00:00.000Z'));
    expect(result.score).toBe(0.85);
    expect(result.state).toBe('unseen');
  });

  it('decays score exponentially after weeks of inactivity', () => {
    // 2 weeks later
    const twoWeeksLater = new Date('2026-09-15T00:00:00.000Z');
    const result = calculateConceptDecay(baseRecord, twoWeeksLater, { decayPerWeek: 0.05 });

    // Expected: 0.85 * (0.95)^2 = 0.85 * 0.9025 ≈ 0.7671
    expect(result.score).toBeLessThan(0.85);
    expect(result.score).toBeCloseTo(0.7671, 2);
    // Not yet 30 days, state remains competent
    expect(result.state).toBe('competent');
  });

  it('marks concept stale when inactive for 30 or more days', () => {
    // 35 days later
    const thirtyFiveDaysLater = new Date('2026-10-06T00:00:00.000Z');
    const result = calculateConceptDecay(baseRecord, thirtyFiveDaysLater, {
      staleInactivityDays: 30,
    });

    expect(result.state).toBe('stale');
    expect(result.score).toBeLessThan(0.70);
  });

  describe('calculateReviewUrgency', () => {
    it('returns 0 for unseen concepts', () => {
      const unseen: MasteryRecord = {
        ...baseRecord,
        state: 'unseen',
        lastPracticedAt: undefined,
      };
      expect(calculateReviewUrgency(unseen)).toBe(0);
    });

    it('returns higher urgency for concepts that have decayed or are marked stale', () => {
      const freshDate = new Date('2026-09-02T00:00:00.000Z');
      const oldDate = new Date('2026-10-15T00:00:00.000Z');

      const freshUrgency = calculateReviewUrgency(baseRecord, freshDate);
      const staleRecord: MasteryRecord = {
        ...baseRecord,
        state: 'stale',
      };
      const oldUrgency = calculateReviewUrgency(staleRecord, oldDate);

      expect(oldUrgency).toBeGreaterThan(freshUrgency);
      expect(oldUrgency).toBeGreaterThan(0.5);
    });
  });
});

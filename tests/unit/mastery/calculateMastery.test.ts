import { describe, it, expect } from 'vitest';
import {
  calculateSessionScore,
  evaluateMasteryTransition,
  updateConceptMastery,
  type SessionMasteryInput,
} from '../../../src/domain/mastery/calculateMastery';
import type { MasteryRecord } from '../../../src/domain/mastery/MasteryRecord';

describe('Sub-Phase 8.1: Pure Domain Mastery Algorithm', () => {
  describe('calculateSessionScore', () => {
    it('awards full 100 points for first-attempt, zero-hint, zero-error completion', () => {
      const input: SessionMasteryInput = {
        completed: true,
        hintsUsed: 0,
        attempts: 1,
        errorCount: 0,
        mode: 'guided',
      };

      const result = calculateSessionScore(input);
      expect(result.completionScore).toBe(40);
      expect(result.hintPenalty).toBe(0);
      expect(result.attemptScore).toBe(30);
      expect(result.fluencyScore).toBe(30);
      expect(result.modeBonus).toBe(0);
      expect(result.totalScore).toBe(100);
      expect(result.normalizedScore).toBe(1.0);
    });

    it('penalizes hints up to -25 points maximum', () => {
      const oneHint: SessionMasteryInput = {
        completed: true,
        hintsUsed: 1,
        attempts: 1,
        errorCount: 0,
      };
      const resultOne = calculateSessionScore(oneHint);
      expect(resultOne.hintPenalty).toBe(10);
      expect(resultOne.totalScore).toBe(90);

      const threeHints: SessionMasteryInput = {
        completed: true,
        hintsUsed: 3,
        attempts: 1,
        errorCount: 0,
      };
      const resultThree = calculateSessionScore(threeHints);
      // Capped at 25 points
      expect(resultThree.hintPenalty).toBe(25);
      expect(resultThree.totalScore).toBe(75);
    });

    it('reduces attempt score upon multiple retries', () => {
      const attempt2 = calculateSessionScore({
        completed: true,
        hintsUsed: 0,
        attempts: 2,
        errorCount: 0,
      });
      expect(attempt2.attemptScore).toBe(22);
      expect(attempt2.totalScore).toBe(92);

      const attempt3 = calculateSessionScore({
        completed: true,
        hintsUsed: 0,
        attempts: 3,
        errorCount: 0,
      });
      expect(attempt3.attemptScore).toBe(15);
      expect(attempt3.totalScore).toBe(85);
    });

    it('reduces fluency score when errors are encountered', () => {
      const oneError = calculateSessionScore({
        completed: true,
        hintsUsed: 0,
        attempts: 1,
        errorCount: 1,
      });
      expect(oneError.fluencyScore).toBe(22);

      const twoErrors = calculateSessionScore({
        completed: true,
        hintsUsed: 0,
        attempts: 1,
        errorCount: 2,
      });
      expect(twoErrors.fluencyScore).toBe(15);
    });

    it('awards bonus points for blind mode completions', () => {
      const blind = calculateSessionScore({
        completed: true,
        hintsUsed: 0,
        attempts: 2, // 22 pts
        errorCount: 1, // 22 pts
        mode: 'blind',
      });
      // 40 + 22 + 22 + 5 (bonus) = 89
      expect(blind.modeBonus).toBe(5);
      expect(blind.totalScore).toBe(89);
    });

    it('yields 0 completionScore for failed or incomplete sessions', () => {
      const failed = calculateSessionScore({
        completed: false,
        hintsUsed: 2,
        attempts: 2,
        errorCount: 3,
      });
      expect(failed.completionScore).toBe(0);
      expect(failed.totalScore).toBeLessThan(20);
    });
  });

  describe('evaluateMasteryTransition', () => {
    it('returns unseen when encounters is 0', () => {
      expect(evaluateMasteryTransition(0, 0, 0, 0, 'unseen')).toBe('unseen');
    });

    it('returns introduced after 1 failed attempt', () => {
      expect(evaluateMasteryTransition(1, 0, 0, 0.2, 'unseen')).toBe('introduced');
    });

    it('returns practicing when below competent thresholds', () => {
      expect(evaluateMasteryTransition(2, 2, 0, 0.8, 'introduced')).toBe('practicing');
      expect(evaluateMasteryTransition(3, 1, 0, 0.4, 'practicing')).toBe('practicing');
    });

    it('promotes to competent when encounters >= 3, score >= 0.65, and success rate >= 70%', () => {
      expect(evaluateMasteryTransition(3, 3, 0, 0.75, 'practicing')).toBe('competent');
    });

    it('promotes to proficient when encounters >= 5, score >= 0.80, success rate >= 80%, and blindSuccess >= 1', () => {
      expect(evaluateMasteryTransition(5, 5, 1, 0.85, 'competent')).toBe('proficient');
    });

    it('promotes to mastered when encounters >= 8, score >= 0.90, success rate >= 85%, and blindSuccess >= 2', () => {
      expect(evaluateMasteryTransition(8, 7, 2, 0.92, 'proficient')).toBe('mastered');
    });
  });

  describe('updateConceptMastery', () => {
    it('creates a fresh record on first encounter', () => {
      const updated = updateConceptMastery(undefined, 'concept.pwd', {
        completed: true,
        hintsUsed: 0,
        attempts: 1,
        errorCount: 0,
        mode: 'guided',
      });

      expect(updated.conceptId).toBe('concept.pwd');
      expect(updated.encounters).toBe(1);
      expect(updated.successes).toBe(1);
      expect(updated.guidedSuccesses).toBe(1);
      expect(updated.blindSuccesses).toBe(0);
      expect(updated.score).toBe(1.0);
      expect(updated.state).toBe('practicing');
      expect(updated.firstSeenAt).toBeDefined();
    });

    it('smooths score over subsequent encounters using moving average', () => {
      const initial: MasteryRecord = {
        conceptId: 'concept.ls',
        state: 'practicing',
        score: 0.8,
        encounters: 2,
        successes: 2,
        failures: 0,
        guidedSuccesses: 2,
        blindSuccesses: 0,
        hintsUsed: 0,
        updatedAt: new Date().toISOString(),
      };

      // Learner fails the next session (score ~ 0.1)
      const updated = updateConceptMastery(initial, 'concept.ls', {
        completed: false,
        hintsUsed: 2,
        attempts: 3,
        errorCount: 3,
      });

      expect(updated.encounters).toBe(3);
      expect(updated.successes).toBe(2);
      expect(updated.failures).toBe(1);
      // New score: 0.8 * 0.7 + sessionScore * 0.3
      expect(updated.score).toBeLessThan(0.8);
      expect(updated.score).toBeGreaterThan(0.5);
    });
  });
});

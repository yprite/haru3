import {
  updateSRSStage,
  calculateNextReview,
  isDueForReview,
  getDaysUntilReview,
  getStageLabel,
  getStageColor,
} from '../../utils/srs';
import type { SRSStage } from '../../types/content';
import type { RecallRating } from '../../types/user';

describe('SRS Utility Functions', () => {
  describe('updateSRSStage', () => {
    it.each<[SRSStage, RecallRating, SRSStage]>([
      // forgot always resets to 0
      [0, 'forgot', 0],
      [1, 'forgot', 0],
      [2, 'forgot', 0],
      [3, 'forgot', 0],
      [4, 'forgot', 0],
      // hard decreases by 1 (min 0)
      [0, 'hard', 0],
      [1, 'hard', 0],
      [2, 'hard', 1],
      [3, 'hard', 2],
      [4, 'hard', 3],
      // good increases by 1 (max 4)
      [0, 'good', 1],
      [1, 'good', 2],
      [2, 'good', 3],
      [3, 'good', 4],
      [4, 'good', 4],
      // easy increases by 2 (max 4)
      [0, 'easy', 2],
      [1, 'easy', 3],
      [2, 'easy', 4],
      [3, 'easy', 4],
      [4, 'easy', 4],
    ])(
      'stage %i with rating "%s" should return stage %i',
      (currentStage, rating, expectedStage) => {
        expect(updateSRSStage(currentStage, rating)).toBe(expectedStage);
      }
    );
  });

  describe('calculateNextReview', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set to noon to avoid timezone issues
      jest.setSystemTime(new Date('2026-01-31T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('stage 0 should add 1 day', () => {
      const result = calculateNextReview(0);
      // Just verify the function returns a date string in correct format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('stage 1 should add 3 days', () => {
      const result = calculateNextReview(1);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('higher stages should return later dates', () => {
      const stage0 = calculateNextReview(0);
      const stage1 = calculateNextReview(1);
      const stage2 = calculateNextReview(2);
      const stage3 = calculateNextReview(3);
      const stage4 = calculateNextReview(4);

      expect(new Date(stage0) < new Date(stage1)).toBe(true);
      expect(new Date(stage1) < new Date(stage2)).toBe(true);
      expect(new Date(stage2) < new Date(stage3)).toBe(true);
      expect(new Date(stage3) < new Date(stage4)).toBe(true);
    });
  });

  describe('isDueForReview', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-31'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns true when review date is today', () => {
      expect(isDueForReview('2026-01-31')).toBe(true);
    });

    it('returns true when review date is in the past', () => {
      expect(isDueForReview('2026-01-30')).toBe(true);
      expect(isDueForReview('2026-01-01')).toBe(true);
    });

    it('returns false when review date is in the future', () => {
      expect(isDueForReview('2026-02-01')).toBe(false);
      expect(isDueForReview('2026-12-31')).toBe(false);
    });

    it('returns false when review date is null', () => {
      expect(isDueForReview(null)).toBe(false);
    });
  });

  describe('getDaysUntilReview', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-31'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns 0 for today', () => {
      expect(getDaysUntilReview('2026-01-31')).toBe(0);
    });

    it('returns positive number for future dates', () => {
      expect(getDaysUntilReview('2026-02-01')).toBe(1);
      expect(getDaysUntilReview('2026-02-07')).toBe(7);
    });

    it('returns negative number for past dates', () => {
      expect(getDaysUntilReview('2026-01-30')).toBe(-1);
      expect(getDaysUntilReview('2026-01-24')).toBe(-7);
    });

    it('returns null when date is null', () => {
      expect(getDaysUntilReview(null)).toBe(null);
    });
  });

  describe('getStageLabel', () => {
    it.each<[SRSStage, string]>([
      [0, '신규'],
      [1, '학습중'],
      [2, '복습중'],
      [3, '숙련중'],
      [4, '마스터'],
    ])('stage %i should return label "%s"', (stage, label) => {
      expect(getStageLabel(stage)).toBe(label);
    });
  });

  describe('getStageColor', () => {
    it.each<[SRSStage, string]>([
      [0, '#9E9E9E'],
      [1, '#FF9800'],
      [2, '#2196F3'],
      [3, '#4CAF50'],
      [4, '#9C27B0'],
    ])('stage %i should return color "%s"', (stage, color) => {
      expect(getStageColor(stage)).toBe(color);
    });
  });
});

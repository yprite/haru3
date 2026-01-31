import { calculateNextReview } from '../../utils/srs';
import { SRS_INTERVALS } from '../../types/content';
import type { SRSStage } from '../../types/content';

/**
 * BUG INVESTIGATION: SRS Intervals
 *
 * Current SRS_INTERVALS = [0, 3, 7, 14, 30]
 * - Stage 0: 0 days (same day review)
 * - Stage 1: 3 days later
 * - Stage 2: 7 days later
 * - Stage 3: 14 days later
 * - Stage 4: 30 days later (mastered)
 *
 * Problem: User reports "review complete" always showing.
 *
 * This test file investigates the actual behavior of calculateNextReview.
 */
describe('SRS Intervals Bug Investigation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-31T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('SRS_INTERVALS constant', () => {
    it('should have correct interval values', () => {
      expect(SRS_INTERVALS[0]).toBe(0); // same day
      expect(SRS_INTERVALS[1]).toBe(3);
      expect(SRS_INTERVALS[2]).toBe(7);
      expect(SRS_INTERVALS[3]).toBe(14);
      expect(SRS_INTERVALS[4]).toBe(30);
    });
  });

  describe('calculateNextReview actual dates', () => {
    it('stage 0 with interval 0 should return TODAY (2026-01-31)', () => {
      // SRS_INTERVALS[0] = 0
      // Today + 0 days = Today
      const result = calculateNextReview(0);
      expect(result).toBe('2026-01-31');
    });

    it('stage 1 with interval 3 should return 3 days later (2026-02-03)', () => {
      // SRS_INTERVALS[1] = 3
      // Today (Jan 31) + 3 days = Feb 3
      const result = calculateNextReview(1);
      expect(result).toBe('2026-02-03');
    });

    it('stage 2 with interval 7 should return 7 days later (2026-02-07)', () => {
      // SRS_INTERVALS[2] = 7
      // Today (Jan 31) + 7 days = Feb 7
      const result = calculateNextReview(2);
      expect(result).toBe('2026-02-07');
    });

    it('stage 3 with interval 14 should return 14 days later (2026-02-14)', () => {
      // SRS_INTERVALS[3] = 14
      // Today (Jan 31) + 14 days = Feb 14
      const result = calculateNextReview(3);
      expect(result).toBe('2026-02-14');
    });

    it('stage 4 with interval 30 should return 30 days later (2026-03-02)', () => {
      // SRS_INTERVALS[4] = 30
      // Today (Jan 31) + 30 days = Mar 2
      const result = calculateNextReview(4);
      expect(result).toBe('2026-03-02');
    });
  });

  describe('BUG: Stage 0 behavior analysis', () => {
    /**
     * The expected learning flow:
     *
     * 1. User learns sentence for FIRST TIME
     *    - updateProgressAfterReview(sentenceId, 'good')
     *    - Current stage: null/undefined -> treated as 0
     *    - New stage: 0 + 1 = 1 (good rating increases by 1)
     *    - nextReviewDate = calculateNextReview(1) = today + 3 days
     *
     * 2. This means FIRST REVIEW is 3 days later, NOT same day!
     *
     * The SRS_INTERVALS[0] = 0 is for when user FAILS (rating='forgot')
     * and gets reset to stage 0. Then they should review immediately.
     *
     * BUT: In initial learning, user starts at stage 0 and moves UP.
     * So after first 'good' rating: stage 0 -> 1, nextReview = today + 3.
     *
     * This is CORRECT behavior! The "bug" might be a misunderstanding.
     */
    it('CORRECT: After first "good" rating, review should be 3 days later', () => {
      // User completes first learning with 'good' rating
      // updateSRSStage(0, 'good') = 1
      // calculateNextReview(1) = today + 3 days
      const result = calculateNextReview(1);
      expect(result).toBe('2026-02-03');
    });

    it('CORRECT: After "forgot" rating, review should be same day', () => {
      // User forgot, reset to stage 0
      // updateSRSStage(any, 'forgot') = 0
      // calculateNextReview(0) = today + 0 days = today
      const result = calculateNextReview(0);
      expect(result).toBe('2026-01-31');
    });

    it('EDGE CASE: "easy" rating on first learning jumps to stage 2', () => {
      // User finds it easy, jumps to stage 2
      // updateSRSStage(0, 'easy') = 2
      // calculateNextReview(2) = today + 7 days
      const result = calculateNextReview(2);
      expect(result).toBe('2026-02-07');
    });
  });
});

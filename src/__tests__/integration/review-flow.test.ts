import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProgress } from '../../types';
import { updateSRSStage, calculateNextReview } from '../../utils/srs';
import { SRS_INTERVALS } from '../../types/content';
import { userProgressRepository } from '../../repositories/UserProgressRepository';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

/**
 * Integration Test: Review Flow
 *
 * This test documents the complete review flow and verifies
 * that the behavior matches user expectations.
 */
describe('Review Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-31T12:00:00.000Z'));
    // Clear the repository cache by accessing internal state
    // @ts-expect-error accessing private property for testing
    userProgressRepository.progressCache = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('First Learning Flow', () => {
    it('documents SRS intervals for reference', () => {
      // Document the current SRS intervals
      expect(SRS_INTERVALS).toEqual([0, 3, 7, 14, 30]);
      // Stage 0: Immediate (0 days) - for "forgot" recovery
      // Stage 1: 3 days - after first successful review
      // Stage 2: 7 days
      // Stage 3: 14 days
      // Stage 4: 30 days (mastered)
    });

    it('first learning with "good" rating sets nextReviewDate to 3 days later', () => {
      // Simulate first learning
      const currentStage = 0; // Initial state
      const rating = 'good' as const;

      const newStage = updateSRSStage(currentStage, rating);
      const nextReviewDate = calculateNextReview(newStage);

      // Stage advances from 0 to 1
      expect(newStage).toBe(1);
      // Review is scheduled for 3 days later (Feb 3)
      expect(nextReviewDate).toBe('2026-02-03');
    });

    it('first learning with "easy" rating sets nextReviewDate to 7 days later', () => {
      const currentStage = 0;
      const rating = 'easy' as const;

      const newStage = updateSRSStage(currentStage, rating);
      const nextReviewDate = calculateNextReview(newStage);

      // Stage jumps from 0 to 2
      expect(newStage).toBe(2);
      // Review is scheduled for 7 days later (Feb 7)
      expect(nextReviewDate).toBe('2026-02-07');
    });

    it('learning with "forgot" rating keeps nextReviewDate to same day', () => {
      const currentStage = 1; // Already at stage 1
      const rating = 'forgot' as const;

      const newStage = updateSRSStage(currentStage, rating);
      const nextReviewDate = calculateNextReview(newStage);

      // Stage resets to 0
      expect(newStage).toBe(0);
      // Review is scheduled for same day (immediate)
      expect(nextReviewDate).toBe('2026-01-31');
    });
  });

  describe('Review Queue Filtering', () => {
    it('sentence learned today with "good" should NOT be in review queue today', async () => {
      // Setup: User learned sentence today with 'good' rating
      // Result: srsStage=1, nextReviewDate=2026-02-03
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-02-03', // 3 days later
          lastStudiedAt: '2026-01-31T10:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-01-31'); // Today

      // Sentence should NOT be in queue (review date is Feb 3)
      expect(queue).not.toContain('sentence-1');
      expect(queue).toHaveLength(0);
    });

    it('sentence that user "forgot" should be in review queue same day', async () => {
      // Setup: User forgot sentence today
      // Result: srsStage=0, nextReviewDate=2026-01-31 (today)
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 0,
          nextReviewDate: '2026-01-31', // Same day (immediate review)
          lastStudiedAt: '2026-01-31T10:00:00.000Z',
          reviewCount: 2,
          masteredAt: null,
          consecutiveCorrect: 0,
          totalAttempts: 2,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-01-31'); // Today

      // Sentence SHOULD be in queue (forgot -> immediate review)
      expect(queue).toContain('sentence-1');
    });

    it('sentence learned 3 days ago with "good" should be in review queue today', async () => {
      // Setup: User learned sentence on Jan 28 with 'good' rating
      // Result: srsStage=1, nextReviewDate=2026-01-31 (today = Jan 28 + 3 days)
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-01-31', // Today (3 days after Jan 28)
          lastStudiedAt: '2026-01-28T10:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-01-31'); // Today

      // Sentence SHOULD be in queue
      expect(queue).toContain('sentence-1');
    });

    it('overdue sentences should be in review queue', async () => {
      // Setup: User missed review date (Jan 29), checking on Jan 31
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-01-29', // 2 days overdue
          lastStudiedAt: '2026-01-26T10:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-01-31'); // Today

      // Overdue sentence SHOULD be in queue
      expect(queue).toContain('sentence-1');
    });
  });

  describe('User Scenario: "Always seeing review complete"', () => {
    /**
     * This is the reported bug scenario.
     *
     * Expected user journey:
     * 1. User opens app first time
     * 2. User learns 3 sentences with 'good' rating
     * 3. User goes to Review tab
     * 4. User sees "review complete" (Review Complete)
     *
     * This is CORRECT behavior because:
     * - First learning sets nextReviewDate to 3 days later
     * - Review queue only shows sentences where nextReviewDate <= today
     * - Today's learned sentences won't appear until 3 days later
     *
     * CONCLUSION: This is NOT a bug, it's the intended SRS behavior.
     * The app could add a UX improvement to explain this to users.
     */
    it('newly learned sentences do not appear in review queue same day', async () => {
      // User just learned 3 sentences today with 'good' rating
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-02-03', // 3 days later
          lastStudiedAt: '2026-01-31T10:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-2',
          srsStage: 1,
          nextReviewDate: '2026-02-03',
          lastStudiedAt: '2026-01-31T10:15:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-3',
          srsStage: 1,
          nextReviewDate: '2026-02-03',
          lastStudiedAt: '2026-01-31T10:30:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-01-31'); // Today

      // Review queue should be EMPTY today
      expect(queue).toHaveLength(0);
    });

    it('sentences appear in review queue after 3 days', async () => {
      // User learned 3 sentences on Jan 31
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-02-03', // Review due on Feb 3
          lastStudiedAt: '2026-01-31T10:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-2',
          srsStage: 1,
          nextReviewDate: '2026-02-03',
          lastStudiedAt: '2026-01-31T10:15:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-3',
          srsStage: 1,
          nextReviewDate: '2026-02-03',
          lastStudiedAt: '2026-01-31T10:30:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue('2026-02-03'); // 3 days later

      // All 3 sentences should be in queue
      expect(queue).toHaveLength(3);
      expect(queue).toContain('sentence-1');
      expect(queue).toContain('sentence-2');
      expect(queue).toContain('sentence-3');
    });
  });
});

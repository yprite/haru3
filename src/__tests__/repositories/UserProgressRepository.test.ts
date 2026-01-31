import AsyncStorage from '@react-native-async-storage/async-storage';
import { userProgressRepository } from '../../repositories/UserProgressRepository';
import type { UserProgress } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('UserProgressRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the repository cache
    // @ts-expect-error accessing private property for testing
    userProgressRepository.progressCache = null;
  });

  describe('getReviewQueue', () => {
    it('returns sentence IDs where nextReviewDate <= today', async () => {
      const today = '2026-01-31';
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-01-30', // yesterday - should be included
          lastStudiedAt: '2026-01-27T12:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-2',
          srsStage: 1,
          nextReviewDate: '2026-01-31', // today - should be included
          lastStudiedAt: '2026-01-28T12:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
        {
          sentenceId: 'sentence-3',
          srsStage: 1,
          nextReviewDate: '2026-02-01', // tomorrow - should NOT be included
          lastStudiedAt: '2026-01-29T12:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue(today);

      expect(queue).toHaveLength(2);
      expect(queue).toContain('sentence-1');
      expect(queue).toContain('sentence-2');
      expect(queue).not.toContain('sentence-3');
    });

    it('returns empty array when no progress exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const queue = await userProgressRepository.getReviewQueue('2026-01-31');

      expect(queue).toEqual([]);
    });

    it('returns empty array when all reviews are in the future', async () => {
      const today = '2026-01-31';
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-02-03', // 3 days later
          lastStudiedAt: '2026-01-31T12:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue(today);

      expect(queue).toEqual([]);
    });

    it('excludes progress with null nextReviewDate', async () => {
      const today = '2026-01-31';
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 0,
          nextReviewDate: null as unknown as string, // null nextReviewDate
          lastStudiedAt: '2026-01-31T12:00:00.000Z',
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue(today);

      expect(queue).toEqual([]);
    });
  });

  describe('SRS behavior documentation', () => {
    /**
     * These tests document the expected SRS behavior, not bugs.
     *
     * Key insight: After first learning with 'good' rating,
     * the sentence moves to stage 1 with a 3-day interval.
     * This means it won't appear in review queue until 3 days later.
     */
    it('sentence at stage 0 with today as nextReviewDate is in queue', async () => {
      const today = '2026-01-31';

      // Sentence that user "forgot" - reset to stage 0 with immediate review
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 0,
          nextReviewDate: today, // Today - should be in queue
          lastStudiedAt: `${today}T10:00:00.000Z`,
          reviewCount: 2,
          masteredAt: null,
          consecutiveCorrect: 0,
          totalAttempts: 2,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue(today);

      expect(queue).toContain('sentence-1');
    });

    it('sentence at stage 1 with future nextReviewDate is NOT in queue', async () => {
      const today = '2026-01-31';

      // Sentence learned today with 'good' - stage 1, review in 3 days
      const mockProgress: UserProgress[] = [
        {
          sentenceId: 'sentence-1',
          srsStage: 1,
          nextReviewDate: '2026-02-03', // 3 days later
          lastStudiedAt: `${today}T10:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress)
      );

      const queue = await userProgressRepository.getReviewQueue(today);

      expect(queue).not.toContain('sentence-1');
      expect(queue).toHaveLength(0);
    });
  });
});

import { renderHook } from '@testing-library/react-native';
import type { UserProgress } from '../../types';

// Mock getToday - must be done before the store module is loaded
const mockGetToday = jest.fn().mockReturnValue('2026-01-31');

jest.mock('../../utils', () => {
  const actual = jest.requireActual('../../utils');
  return {
    ...actual,
    getToday: () => mockGetToday(),
  };
});

// Mock the repository
jest.mock('../../repositories/UserProgressRepository', () => ({
  userProgressRepository: {
    getAllProgress: jest.fn(),
    getStats: jest.fn(),
    getSettings: jest.fn(),
    getReviewQueue: jest.fn(),
    updateProgressAfterReview: jest.fn(),
    updateSettings: jest.fn(),
    updateStats: jest.fn(),
    clearAllData: jest.fn(),
  },
}));

// Import after mocks are set up
import { useProgressStore } from '../../stores/useProgressStore';

describe('useProgressStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToday.mockReturnValue('2026-01-31');
    // Reset store state
    useProgressStore.setState({
      progressMap: new Map(),
      stats: null,
      settings: null,
      reviewQueue: [],
      isLoading: false,
      error: null,
    });
  });

  describe('getNextReviewDate', () => {
    it('returns null when review queue is not empty', () => {
      useProgressStore.setState({
        reviewQueue: ['sentence-1'],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1,
              nextReviewDate: '2026-01-31',
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBeNull();
    });

    it('returns null when no progress exists', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map(),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBeNull();
    });

    it('returns earliest future review date when queue is empty', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1,
              nextReviewDate: '2026-02-05', // 5 days later
            } as UserProgress,
          ],
          [
            'sentence-2',
            {
              sentenceId: 'sentence-2',
              srsStage: 1,
              nextReviewDate: '2026-02-03', // 3 days later (earliest)
            } as UserProgress,
          ],
          [
            'sentence-3',
            {
              sentenceId: 'sentence-3',
              srsStage: 2,
              nextReviewDate: '2026-02-07', // 7 days later
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBe('2026-02-03'); // Earliest future date
    });

    it('ignores past review dates', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1,
              nextReviewDate: '2026-01-30', // Yesterday (past)
            } as UserProgress,
          ],
          [
            'sentence-2',
            {
              sentenceId: 'sentence-2',
              srsStage: 1,
              nextReviewDate: '2026-02-03', // Future
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBe('2026-02-03');
    });

    it('ignores today review date (should be in queue instead)', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1,
              nextReviewDate: '2026-01-31', // Today (should be in queue)
            } as UserProgress,
          ],
          [
            'sentence-2',
            {
              sentenceId: 'sentence-2',
              srsStage: 1,
              nextReviewDate: '2026-02-03', // Future
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBe('2026-02-03');
    });

    it('returns null when all progress has past or today review dates', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1,
              nextReviewDate: '2026-01-30', // Yesterday
            } as UserProgress,
          ],
          [
            'sentence-2',
            {
              sentenceId: 'sentence-2',
              srsStage: 1,
              nextReviewDate: '2026-01-31', // Today
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBeNull();
    });

    it('handles null nextReviewDate in progress', () => {
      useProgressStore.setState({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 0,
              nextReviewDate: null as unknown as string,
            } as UserProgress,
          ],
          [
            'sentence-2',
            {
              sentenceId: 'sentence-2',
              srsStage: 1,
              nextReviewDate: '2026-02-03',
            } as UserProgress,
          ],
        ]),
      });

      const { result } = renderHook(() => useProgressStore());
      const nextDate = result.current.getNextReviewDate();

      expect(nextDate).toBe('2026-02-03');
    });
  });
});

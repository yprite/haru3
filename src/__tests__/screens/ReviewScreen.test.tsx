import React from 'react';
import { render, screen } from '../test-utils';
import ReviewScreen from '../../../app/(tabs)/review';
import { useContentStore, useProgressStore, useSessionStore } from '../../stores';
import { mockSentences } from '../mocks/data';

// Mock the stores
jest.mock('../../stores', () => ({
  useContentStore: jest.fn(),
  useProgressStore: jest.fn(),
  useSessionStore: jest.fn(),
}));

describe('ReviewScreen', () => {
  const mockStartSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for SessionStore
    (useSessionStore as jest.Mock).mockReturnValue({
      startSession: mockStartSession,
      sessionQueue: [],
      currentIndex: 0,
    });
  });

  describe('when there are NO items in review queue', () => {
    beforeEach(() => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: [], // 빈 큐
        progressMap: new Map(),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });
    });

    it('shows "복습 완료!" message', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('복습 완료!')).toBeTruthy();
    });

    it('shows empty state subtitle', () => {
      render(<ReviewScreen />);
      expect(screen.getByText(/오늘 복습할 문장이 없어요/)).toBeTruthy();
    });

    it('shows "학습하러 가기" button', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('학습하러 가기')).toBeTruthy();
    });

    it('does NOT show review queue count badge', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText(/개$/)).toBeNull();
    });

    it('does NOT show "복습 대기" title', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText('복습 대기')).toBeNull();
    });

    it('does NOT show forgetting curve card', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText('망각 곡선')).toBeNull();
    });

    it('does NOT show "지금 복습하기" button', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText(/지금 복습하기/)).toBeNull();
    });
  });

  describe('when there ARE items in review queue', () => {
    beforeEach(() => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: ['sentence-1', 'sentence-2', 'sentence-3'], // 3개 대기
        progressMap: new Map([
          ['sentence-1', { sentenceId: 'sentence-1', srsStage: 1 as const }],
          ['sentence-2', { sentenceId: 'sentence-2', srsStage: 0 as const }],
          ['sentence-3', { sentenceId: 'sentence-3', srsStage: 2 as const }],
        ]),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });
    });

    it('shows "복습 대기" title', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('복습 대기')).toBeTruthy();
    });

    it('shows correct count in badge', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('3개')).toBeTruthy();
    });

    it('shows forgetting curve card', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('망각 곡선')).toBeTruthy();
    });

    it('shows subtitle about forgetting curve', () => {
      render(<ReviewScreen />);
      expect(screen.getByText(/에빙하우스 망각곡선/)).toBeTruthy();
    });

    it('shows "지금 복습하기" button', () => {
      render(<ReviewScreen />);
      expect(screen.getByText(/지금 복습하기/)).toBeTruthy();
    });

    it('shows all review sentences', () => {
      render(<ReviewScreen />);
      expect(screen.getByText('すみません')).toBeTruthy();
      expect(screen.getByText('ありがとうございます')).toBeTruthy();
      expect(screen.getByText('こんにちは')).toBeTruthy();
    });

    it('does NOT show "복습 완료!" message', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText('복습 완료!')).toBeNull();
    });

    it('does NOT show empty state', () => {
      render(<ReviewScreen />);
      expect(screen.queryByText(/오늘 복습할 문장이 없어요/)).toBeNull();
    });
  });

  describe('REGRESSION: reviewQueue state change', () => {
    it('should update from empty to has items when reviewQueue changes', () => {
      // Start with empty queue
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: [],
        progressMap: new Map(),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      const { rerender } = render(<ReviewScreen />);
      expect(screen.getByText('복습 완료!')).toBeTruthy();

      // Update to have items
      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: ['sentence-1'],
        progressMap: new Map([
          ['sentence-1', { sentenceId: 'sentence-1', srsStage: 1 as const }],
        ]),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      rerender(<ReviewScreen />);
      expect(screen.queryByText('복습 완료!')).toBeNull();
      expect(screen.getByText('복습 대기')).toBeTruthy();
    });

    it('should update from has items to empty when all reviews completed', () => {
      // Start with items
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: ['sentence-1'],
        progressMap: new Map([
          ['sentence-1', { sentenceId: 'sentence-1', srsStage: 1 as const }],
        ]),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      const { rerender } = render(<ReviewScreen />);
      expect(screen.getByText('복습 대기')).toBeTruthy();

      // Update to empty
      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: [],
        progressMap: new Map(),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      rerender(<ReviewScreen />);
      expect(screen.queryByText('복습 대기')).toBeNull();
      expect(screen.getByText('복습 완료!')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles sentences not found in store', () => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: [], // 빈 문장 리스트
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: ['non-existent-sentence'],
        progressMap: new Map(),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      render(<ReviewScreen />);
      // Should show empty state when sentences are not found
      expect(screen.getByText('복습 완료!')).toBeTruthy();
    });

    it('handles loading state', () => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: ['sentence-1'],
        progressMap: new Map(),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue(null),
      });

      // Component should render without throwing
      expect(() => render(<ReviewScreen />)).not.toThrow();
    });
  });

  describe('UX improvement: show next review info when queue is empty', () => {
    /**
     * When user has learned sentences but review queue is empty,
     * we should show when the next review is scheduled.
     * This helps users understand SRS behavior.
     */
    it('shows next review date when sentences exist but queue is empty', () => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      // User has learned sentences with future review dates
      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: [], // Empty queue
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1 as const,
              nextReviewDate: '2026-02-03', // 3 days later
            },
          ],
        ]),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue('2026-02-03'),
      });

      render(<ReviewScreen />);

      // Should show when next review is
      expect(screen.getByText(/다음 복습/)).toBeTruthy();
    });

    it('shows encouraging message about SRS timing', () => {
      (useContentStore as jest.Mock).mockReturnValue({
        sentences: mockSentences,
        loadContent: jest.fn(),
      });

      (useProgressStore as jest.Mock).mockReturnValue({
        reviewQueue: [],
        progressMap: new Map([
          [
            'sentence-1',
            {
              sentenceId: 'sentence-1',
              srsStage: 1 as const,
              nextReviewDate: '2026-02-03',
            },
          ],
        ]),
        loadProgress: jest.fn(),
        loadReviewQueue: jest.fn(),
        getNextReviewDate: jest.fn().mockReturnValue('2026-02-03'),
      });

      render(<ReviewScreen />);

      // Should explain SRS concept
      expect(screen.getByText(/최적의 타이밍/)).toBeTruthy();
    });
  });
});

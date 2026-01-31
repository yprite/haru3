/**
 * useLesson Hook Tests
 *
 * 3문장 제한 기능 테스트 (TDD)
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSessionStore } from '../../stores/useSessionStore';
import { useProgressStore } from '../../stores/useProgressStore';
import { useContentStore } from '../../stores/useContentStore';
import type { Sentence, UserProgress, UserSettings } from '../../types';

// Mock stores
jest.mock('../../stores/useSessionStore');
jest.mock('../../stores/useProgressStore');
jest.mock('../../stores/useContentStore');

// Mock useSpeech
jest.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeaking: false,
  }),
}));

const mockSentences: Sentence[] = [
  {
    id: 'l1_cafe_001',
    jp: 'コーヒーをください',
    kana: 'コーヒーをください',
    kr: '커피 주세요',
    roman: 'koohii o kudasai',
    chunks: [{ jp: 'コーヒー', kana: 'コーヒー', kr: '커피', roman: 'koohii' }],
    categoryId: 'l1_cafe',
    level: 1,
    order: 1,
  },
  {
    id: 'l1_cafe_002',
    jp: 'アイスコーヒー',
    kana: 'アイスコーヒー',
    kr: '아이스 커피',
    roman: 'aisu koohii',
    chunks: [{ jp: 'アイス', kana: 'アイス', kr: '아이스', roman: 'aisu' }],
    categoryId: 'l1_cafe',
    level: 1,
    order: 2,
  },
  {
    id: 'l1_cafe_003',
    jp: 'ホットコーヒー',
    kana: 'ホットコーヒー',
    kr: '핫 커피',
    roman: 'hotto koohii',
    chunks: [{ jp: 'ホット', kana: 'ホット', kr: '핫', roman: 'hotto' }],
    categoryId: 'l1_cafe',
    level: 1,
    order: 3,
  },
  {
    id: 'l1_cafe_004',
    jp: 'お砂糖',
    kana: 'おさとう',
    kr: '설탕',
    roman: 'osatou',
    chunks: [{ jp: '砂糖', kana: 'さとう', kr: '설탕', roman: 'satou' }],
    categoryId: 'l1_cafe',
    level: 1,
    order: 4,
  },
  {
    id: 'l1_cafe_005',
    jp: 'ミルク',
    kana: 'ミルク',
    kr: '우유',
    roman: 'miruku',
    chunks: [{ jp: 'ミルク', kana: 'ミルク', kr: '우유', roman: 'miruku' }],
    categoryId: 'l1_cafe',
    level: 1,
    order: 5,
  },
];

const mockSettings: UserSettings = {
  dailySentenceCount: 3,
  autoPlayAudio: true,
  audioSpeed: 1.0,
  notifications: {
    dailyReminder: true,
    dailyReminderTime: '09:00',
    reviewReminder: true,
    streakReminder: true,
  },
  darkMode: 'system',
};

describe('useLesson - Daily Sentence Limit', () => {
  let mockStartSession: jest.Mock;
  let mockGetSentenceById: jest.Mock;
  let mockGetSentencesByCategory: jest.Mock;
  let mockProgressMap: Map<string, UserProgress>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStartSession = jest.fn();
    mockGetSentenceById = jest.fn();
    mockGetSentencesByCategory = jest.fn();
    mockProgressMap = new Map();

    // Setup useSessionStore mock
    (useSessionStore as unknown as jest.Mock).mockReturnValue({
      currentSentence: null,
      currentStep: 'listen',
      stepIndex: 0,
      sentenceQueue: [],
      queueIndex: 0,
      isSessionActive: false,
      assemblyAnswer: [],
      recallRating: null,
      startSession: mockStartSession,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      setAssemblyAnswer: jest.fn(),
      setRecallRating: jest.fn(),
      goToNextSentence: jest.fn(),
      endSession: jest.fn(() => ({ durationMinutes: 5 })),
    });

    // Setup useProgressStore mock
    (useProgressStore as unknown as jest.Mock).mockReturnValue({
      updateAfterReview: jest.fn(),
      incrementStudyTime: jest.fn(),
      settings: mockSettings,
      progressMap: mockProgressMap,
    });

    // Setup useContentStore mock
    mockGetSentenceById.mockImplementation((id: string) =>
      mockSentences.find((s) => s.id === id)
    );
    mockGetSentencesByCategory.mockImplementation((categoryId: string) =>
      mockSentences.filter((s) => s.categoryId === categoryId)
    );

    (useContentStore as unknown as jest.Mock).mockReturnValue({
      getSentenceById: mockGetSentenceById,
      getSentencesByCategory: mockGetSentencesByCategory,
    });
  });

  describe('getUnlearnedSentences', () => {
    it('should return only sentences not yet studied today', () => {
      // Arrange: User already studied sentence 001 today
      const today = new Date().toISOString();
      mockProgressMap.set('l1_cafe_001', {
        sentenceId: 'l1_cafe_001',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: today,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      // Act: Import the utility function
      const { getUnlearnedSentences } = require('../../utils/lessonUtils');
      const result = getUnlearnedSentences(mockSentences, mockProgressMap);

      // Assert: Should exclude the already studied sentence
      expect(result).toHaveLength(4);
      expect(result.find((s: Sentence) => s.id === 'l1_cafe_001')).toBeUndefined();
    });

    it('should return sentences in order', () => {
      const { getUnlearnedSentences } = require('../../utils/lessonUtils');
      const result = getUnlearnedSentences(mockSentences, mockProgressMap);

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('l1_cafe_001');
      expect(result[1].id).toBe('l1_cafe_002');
    });
  });

  describe('getDailySentenceBatch', () => {
    it('should return exactly dailySentenceCount sentences when available', () => {
      const { getDailySentenceBatch } = require('../../utils/lessonUtils');
      const result = getDailySentenceBatch(mockSentences, mockProgressMap, 3);

      expect(result).toHaveLength(3);
    });

    it('should return remaining sentences when less than dailySentenceCount available', () => {
      // Mark 3 sentences as already studied
      const today = new Date().toISOString();
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id) => {
        mockProgressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: today,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      const { getDailySentenceBatch } = require('../../utils/lessonUtils');
      const result = getDailySentenceBatch(mockSentences, mockProgressMap, 3);

      expect(result).toHaveLength(2); // Only 2 unlearned sentences left
    });

    it('should return empty array when all sentences studied today', () => {
      // Mark all sentences as studied today
      const today = new Date().toISOString();
      mockSentences.forEach((s) => {
        mockProgressMap.set(s.id, {
          sentenceId: s.id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: today,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      const { getDailySentenceBatch } = require('../../utils/lessonUtils');
      const result = getDailySentenceBatch(mockSentences, mockProgressMap, 3);

      expect(result).toHaveLength(0);
    });
  });

  describe('isDailyGoalReached', () => {
    it('should return false when studied less than daily goal', () => {
      const { isDailyGoalReached } = require('../../utils/lessonUtils');
      const result = isDailyGoalReached(mockProgressMap, 3);

      expect(result).toBe(false);
    });

    it('should return true when studied equal to daily goal', () => {
      const today = new Date().toISOString();
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id) => {
        mockProgressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: today,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      const { isDailyGoalReached } = require('../../utils/lessonUtils');
      const result = isDailyGoalReached(mockProgressMap, 3);

      expect(result).toBe(true);
    });

    it('should return true when studied more than daily goal', () => {
      const today = new Date().toISOString();
      mockSentences.forEach((s) => {
        mockProgressMap.set(s.id, {
          sentenceId: s.id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: today,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      const { isDailyGoalReached } = require('../../utils/lessonUtils');
      const result = isDailyGoalReached(mockProgressMap, 3);

      expect(result).toBe(true);
    });
  });

  describe('getTodayStudiedCount', () => {
    it('should return 0 when no sentences studied today', () => {
      const { getTodayStudiedCount } = require('../../utils/lessonUtils');
      const result = getTodayStudiedCount(mockProgressMap);

      expect(result).toBe(0);
    });

    it('should count only sentences studied today', () => {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      mockProgressMap.set('l1_cafe_001', {
        sentenceId: 'l1_cafe_001',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: today,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      mockProgressMap.set('l1_cafe_002', {
        sentenceId: 'l1_cafe_002',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: yesterday, // Studied yesterday
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      const { getTodayStudiedCount } = require('../../utils/lessonUtils');
      const result = getTodayStudiedCount(mockProgressMap);

      expect(result).toBe(1);
    });
  });
});

describe('useSessionStore - Daily Goal State', () => {
  it('should track if daily goal is reached in session', () => {
    const { useSessionStore: realSessionStore } = jest.requireActual('../../stores/useSessionStore');

    // This test verifies the store can track daily goal state
    // Will be implemented when we add isDailyGoalReached to the store
    expect(true).toBe(true); // Placeholder
  });
});

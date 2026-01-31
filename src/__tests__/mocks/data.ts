import type { Sentence, Category } from '../../types/content';
import type { UserProgress, LearningStats } from '../../types/user';

// Mock Sentences
export const mockSentences: Sentence[] = [
  {
    id: 'sentence-1',
    categoryId: 'category-1',
    jp: 'すみません',
    kr: '실례합니다',
    romaji: 'sumimasen',
    order: 1,
    chunks: [
      { jp: 'すみません', kr: '실례합니다', romaji: 'sumimasen' },
    ],
    words: [
      { jp: 'すみません', kr: '실례합니다', romaji: 'sumimasen' },
    ],
    tip: '가장 많이 쓰는 일본어 표현 중 하나예요',
  },
  {
    id: 'sentence-2',
    categoryId: 'category-1',
    jp: 'ありがとうございます',
    kr: '감사합니다',
    romaji: 'arigatou gozaimasu',
    order: 2,
    chunks: [
      { jp: 'ありがとう', kr: '고마워', romaji: 'arigatou' },
      { jp: 'ございます', kr: '~합니다', romaji: 'gozaimasu' },
    ],
    words: [
      { jp: 'ありがとう', kr: '고마워', romaji: 'arigatou' },
      { jp: 'ございます', kr: '~합니다 (존댓말)', romaji: 'gozaimasu' },
    ],
  },
  {
    id: 'sentence-3',
    categoryId: 'category-1',
    jp: 'こんにちは',
    kr: '안녕하세요',
    romaji: 'konnichiwa',
    order: 3,
    chunks: [
      { jp: 'こんにちは', kr: '안녕하세요', romaji: 'konnichiwa' },
    ],
    words: [
      { jp: 'こんにちは', kr: '안녕하세요 (낮 인사)', romaji: 'konnichiwa' },
    ],
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: 'category-1',
    name: '인사 & 기본 표현',
    description: '일상에서 가장 많이 쓰는 기본 표현',
    icon: '👋',
    order: 1,
    keyPatterns: ['~ます', '~です'],
  },
  {
    id: 'category-2',
    name: '카페 & 식당',
    description: '음식 주문할 때 필요한 표현',
    icon: '☕',
    order: 2,
    keyPatterns: ['~をください', '~はありますか'],
  },
];

// Mock User Progress
export const mockUserProgress: UserProgress[] = [
  {
    sentenceId: 'sentence-1',
    srsStage: 2,
    correctCount: 5,
    incorrectCount: 1,
    lastStudiedAt: new Date().toISOString(),
    nextReviewDate: '2026-02-07',
  },
  {
    sentenceId: 'sentence-2',
    srsStage: 1,
    correctCount: 2,
    incorrectCount: 0,
    lastStudiedAt: new Date().toISOString(),
    nextReviewDate: '2026-02-03',
  },
];

// Mock Learning Stats
export const mockLearningStats: LearningStats = {
  totalSentencesStudied: 10,
  masteredSentences: 3,
  currentStreak: 5,
  longestStreak: 7,
  totalStudyDays: 15,
  lastStudyDate: new Date().toISOString().split('T')[0],
};

// Helper to create mock progress for today
export const createTodayProgress = (count: number): UserProgress[] => {
  const today = new Date().toISOString();
  return Array.from({ length: count }, (_, i) => ({
    sentenceId: `sentence-${i + 1}`,
    srsStage: 0 as const,
    correctCount: 1,
    incorrectCount: 0,
    lastStudiedAt: today,
    nextReviewDate: '2026-02-01',
  }));
};

// Helper to create mock progress for specific date
export const createProgressForDate = (
  sentenceId: string,
  date: string,
  srsStage: 0 | 1 | 2 | 3 | 4 = 0
): UserProgress => ({
  sentenceId,
  srsStage,
  correctCount: srsStage + 1,
  incorrectCount: 0,
  lastStudiedAt: `${date}T12:00:00.000Z`,
  nextReviewDate: '2026-02-01',
});

import { mockSentences, mockCategories, mockUserProgress, mockLearningStats } from './data';

// Mock ContentStore
export const createMockContentStore = (overrides = {}) => ({
  sentences: mockSentences,
  categories: mockCategories,
  isLoading: false,
  error: null,
  loadContent: jest.fn(),
  ...overrides,
});

// Mock ProgressStore
export const createMockProgressStore = (overrides = {}) => {
  const progressMap = new Map(
    mockUserProgress.map((p) => [p.sentenceId, p])
  );

  return {
    progressMap,
    stats: mockLearningStats,
    reviewQueue: ['sentence-1', 'sentence-2'],
    loadProgress: jest.fn(),
    loadReviewQueue: jest.fn(),
    updateAfterReview: jest.fn(),
    ...overrides,
  };
};

// Mock SessionStore
export const createMockSessionStore = (overrides = {}) => ({
  sessionQueue: [],
  currentIndex: 0,
  startSession: jest.fn(),
  endSession: jest.fn(),
  getCurrentSentence: jest.fn(),
  goToNextSentence: jest.fn(),
  ...overrides,
});

// Mock all stores
export const mockStores = () => {
  jest.mock('../../stores', () => ({
    useContentStore: jest.fn(() => createMockContentStore()),
    useProgressStore: jest.fn(() => createMockProgressStore()),
    useSessionStore: jest.fn(() => createMockSessionStore()),
  }));
};

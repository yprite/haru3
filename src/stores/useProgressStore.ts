import { create } from 'zustand';
import type { UserProgress, UserStats, UserSettings, RecallRating } from '../types';
import { userProgressRepository } from '../repositories';
import { getToday } from '../utils';

interface ProgressState {
  progressMap: Map<string, UserProgress>;
  stats: UserStats | null;
  settings: UserSettings | null;
  reviewQueue: readonly string[];
  isLoading: boolean;
  error: string | null;
}

interface ProgressActions {
  loadProgress: () => Promise<void>;
  loadReviewQueue: () => Promise<void>;
  updateAfterReview: (sentenceId: string, rating: RecallRating) => Promise<void>;
  getProgress: (sentenceId: string) => UserProgress | null;
  getNextReviewDate: () => string | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  incrementStudyTime: (minutes: number) => Promise<void>;
  clearAllData: () => Promise<void>;
}

type ProgressStore = ProgressState & ProgressActions;

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progressMap: new Map(),
  stats: null,
  settings: null,
  reviewQueue: [],
  isLoading: false,
  error: null,

  loadProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const [allProgress, stats, settings] = await Promise.all([
        userProgressRepository.getAllProgress(),
        userProgressRepository.getStats(),
        userProgressRepository.getSettings(),
      ]);
      const progressMap = new Map(allProgress.map((p) => [p.sentenceId, p]));
      set({ progressMap, stats, settings, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load progress';
      set({ error: message, isLoading: false });
    }
  },

  loadReviewQueue: async () => {
    try {
      const today = getToday();
      const reviewQueue = await userProgressRepository.getReviewQueue(today);
      set({ reviewQueue });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load review queue';
      set({ error: message });
    }
  },

  updateAfterReview: async (sentenceId: string, rating: RecallRating) => {
    try {
      const updatedProgress = await userProgressRepository.updateProgressAfterReview(
        sentenceId,
        rating
      );
      const { progressMap, stats } = get();
      const newProgressMap = new Map(progressMap);
      newProgressMap.set(sentenceId, updatedProgress);

      const newStudiedCount = newProgressMap.size;
      const masteredCount = Array.from(newProgressMap.values()).filter(
        (p) => p.srsStage === 4
      ).length;

      const updatedStats = stats
        ? {
            ...stats,
            totalSentencesStudied: newStudiedCount,
            masteredSentences: masteredCount,
          }
        : null;

      set({ progressMap: newProgressMap, stats: updatedStats });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      set({ error: message });
    }
  },

  getProgress: (sentenceId: string) => {
    return get().progressMap.get(sentenceId) ?? null;
  },

  getNextReviewDate: () => {
    const { progressMap, reviewQueue } = get();

    // If there are items in review queue, no need to show next date
    if (reviewQueue.length > 0) {
      return null;
    }

    // Find the earliest future review date
    const today = getToday();
    let earliestDate: string | null = null;

    for (const progress of progressMap.values()) {
      const reviewDate = progress.nextReviewDate;
      if (reviewDate && reviewDate > today) {
        if (!earliestDate || reviewDate < earliestDate) {
          earliestDate = reviewDate;
        }
      }
    }

    return earliestDate;
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      const updated = await userProgressRepository.updateSettings(newSettings);
      set({ settings: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      set({ error: message });
    }
  },

  incrementStudyTime: async (minutes: number) => {
    const { stats } = get();
    if (!stats) return;
    const updated = await userProgressRepository.updateStats({
      totalStudyMinutes: stats.totalStudyMinutes + minutes,
      totalSessions: stats.totalSessions + 1,
    });
    set({ stats: updated });
  },

  clearAllData: async () => {
    await userProgressRepository.clearAllData();
    set({
      progressMap: new Map(),
      stats: null,
      settings: null,
      reviewQueue: [],
    });
  },
}));

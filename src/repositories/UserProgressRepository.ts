import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProgress, UserStats, UserSettings, RecallRating } from '../types';
import type { SRSStage } from '../types/content';
import { calculateNextReview, updateSRSStage } from '../utils/srs';

const STORAGE_KEYS = {
  PROGRESS: 'user_progress',
  STATS: 'user_stats',
  SETTINGS: 'user_settings',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
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

const DEFAULT_STATS: UserStats = {
  totalSentencesStudied: 0,
  masteredSentences: 0,
  totalSessions: 0,
  totalStudyMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  levelProgress: [],
};

export interface UserProgressRepository {
  getProgress(sentenceId: string): Promise<UserProgress | null>;
  getAllProgress(): Promise<readonly UserProgress[]>;
  saveProgress(progress: UserProgress): Promise<void>;
  updateProgressAfterReview(
    sentenceId: string,
    rating: RecallRating
  ): Promise<UserProgress>;
  getReviewQueue(date: string): Promise<readonly string[]>;
  getStats(): Promise<UserStats>;
  updateStats(stats: Partial<UserStats>): Promise<UserStats>;
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
  clearAllData(): Promise<void>;
}

class LocalUserProgressRepository implements UserProgressRepository {
  private progressCache: Map<string, UserProgress> | null = null;

  private async loadProgressMap(): Promise<Map<string, UserProgress>> {
    if (this.progressCache) {
      return this.progressCache;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) {
        const parsed = JSON.parse(data) as UserProgress[];
        this.progressCache = new Map(parsed.map((p) => [p.sentenceId, p]));
      } else {
        this.progressCache = new Map();
      }
    } catch {
      this.progressCache = new Map();
    }

    return this.progressCache;
  }

  private async saveProgressMap(map: Map<string, UserProgress>): Promise<void> {
    try {
      const data = Array.from(map.values());
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
      this.progressCache = map;
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw new Error('진도 저장에 실패했습니다.');
    }
  }

  async getProgress(sentenceId: string): Promise<UserProgress | null> {
    const map = await this.loadProgressMap();
    return map.get(sentenceId) ?? null;
  }

  async getAllProgress(): Promise<readonly UserProgress[]> {
    const map = await this.loadProgressMap();
    return Array.from(map.values());
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    const map = await this.loadProgressMap();
    const newMap = new Map(map);
    newMap.set(progress.sentenceId, progress);
    await this.saveProgressMap(newMap);
  }

  async updateProgressAfterReview(
    sentenceId: string,
    rating: RecallRating
  ): Promise<UserProgress> {
    const map = await this.loadProgressMap();
    const existing = map.get(sentenceId);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const currentStage: SRSStage = existing?.srsStage ?? 0;
    const newStage = updateSRSStage(currentStage, rating);
    const nextReviewDate = calculateNextReview(newStage);
    const isMastered = newStage === 4;

    const updatedProgress: UserProgress = {
      sentenceId,
      srsStage: newStage,
      nextReviewDate,
      lastStudiedAt: now,
      reviewCount: (existing?.reviewCount ?? 0) + 1,
      masteredAt: isMastered ? now : existing?.masteredAt ?? null,
      consecutiveCorrect:
        rating === 'forgot'
          ? 0
          : (existing?.consecutiveCorrect ?? 0) + 1,
      totalAttempts: (existing?.totalAttempts ?? 0) + 1,
    };

    const newMap = new Map(map);
    newMap.set(sentenceId, updatedProgress);
    await this.saveProgressMap(newMap);

    await this.updateStudyStreak(today);

    return updatedProgress;
  }

  private async updateStudyStreak(today: string): Promise<void> {
    const stats = await this.getStats();
    const lastDate = stats.lastStudyDate;

    let newStreak = 1;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor(
        (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        newStreak = stats.currentStreak;
      } else if (diffDays === 1) {
        newStreak = stats.currentStreak + 1;
      }
    }

    await this.updateStats({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastStudyDate: today,
    });
  }

  async getReviewQueue(date: string): Promise<readonly string[]> {
    const map = await this.loadProgressMap();
    const dueIds: string[] = [];

    for (const progress of map.values()) {
      if (progress.nextReviewDate && progress.nextReviewDate <= date) {
        dueIds.push(progress.sentenceId);
      }
    }

    return dueIds;
  }

  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return { ...DEFAULT_STATS, ...JSON.parse(data) };
      }
    } catch {
      // ignore parse errors
    }
    return { ...DEFAULT_STATS };
  }

  async updateStats(updates: Partial<UserStats>): Promise<UserStats> {
    try {
      const current = await this.getStats();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to update stats:', error);
      throw new Error('통계 저장에 실패했습니다.');
    }
  }

  async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // ignore parse errors
    }
    return { ...DEFAULT_SETTINGS };
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw new Error('설정 저장에 실패했습니다.');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.STATS,
        STORAGE_KEYS.SETTINGS,
      ]);
      this.progressCache = null;
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('데이터 삭제에 실패했습니다.');
    }
  }
}

export const userProgressRepository = new LocalUserProgressRepository();

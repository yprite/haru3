import type {
  ContentRepository,
  SentenceFilter,
} from './ContentRepository';
import type {
  Sentence,
  Category,
  Level,
  ContentManifest,
} from '../types';
import {
  LEVELS,
  getLevelById,
  CATEGORIES,
  getCategoryById,
  getCategoriesByLevelId,
  ALL_SENTENCES,
  getSentenceById,
  getSentencesByCategory,
  getSentencesByLevel,
} from '../content';

export class LocalContentRepository implements ContentRepository {
  async getManifest(): Promise<ContentManifest> {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      levelCount: LEVELS.length,
      categoryCount: CATEGORIES.length,
      sentenceCount: ALL_SENTENCES.length,
    };
  }

  async getAllLevels(): Promise<readonly Level[]> {
    return [...LEVELS].sort((a, b) => a.order - b.order);
  }

  async getLevelById(levelId: string): Promise<Level | null> {
    return getLevelById(levelId);
  }

  async getAllCategories(): Promise<readonly Category[]> {
    return [...CATEGORIES].sort((a, b) => {
      if (a.levelId !== b.levelId) {
        return a.levelId.localeCompare(b.levelId);
      }
      return a.order - b.order;
    });
  }

  async getCategoriesByLevel(levelId: string): Promise<readonly Category[]> {
    return [...getCategoriesByLevelId(levelId)].sort((a, b) => a.order - b.order);
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    return getCategoryById(categoryId);
  }

  async getSentencesByCategory(categoryId: string): Promise<readonly Sentence[]> {
    return [...getSentencesByCategory(categoryId)].sort((a, b) => a.order - b.order);
  }

  async getSentencesByLevel(level: 1 | 2 | 3): Promise<readonly Sentence[]> {
    return [...getSentencesByLevel(level)].sort((a, b) => a.order - b.order);
  }

  async getAllSentences(): Promise<readonly Sentence[]> {
    return [...ALL_SENTENCES].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.order - b.order;
    });
  }

  async getSentenceById(sentenceId: string): Promise<Sentence | null> {
    return getSentenceById(sentenceId);
  }

  async getSentencesByIds(sentenceIds: readonly string[]): Promise<readonly Sentence[]> {
    const idSet = new Set(sentenceIds);
    return ALL_SENTENCES.filter((sentence) => idSet.has(sentence.id));
  }

  async searchSentences(filter: SentenceFilter): Promise<readonly Sentence[]> {
    let results = [...ALL_SENTENCES];

    if (filter.categoryId) {
      results = results.filter((s) => s.categoryId === filter.categoryId);
    }

    if (filter.level) {
      results = results.filter((s) => s.level === filter.level);
    }

    results.sort((a, b) => a.order - b.order);

    if (filter.offset) {
      results = results.slice(filter.offset);
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  async getDailySentences(
    _date: string,
    count: number = 3,
    excludeIds: readonly string[] = []
  ): Promise<readonly Sentence[]> {
    const excludeSet = new Set(excludeIds);
    const available = ALL_SENTENCES.filter((s) => !excludeSet.has(s.id));

    return available.slice(0, count);
  }
}

export const localContentRepository = new LocalContentRepository();

import { create } from 'zustand';
import type { Sentence, Category, Level } from '../types';
import { localContentRepository } from '../repositories';

interface ContentState {
  levels: readonly Level[];
  categories: readonly Category[];
  sentences: readonly Sentence[];
  isLoading: boolean;
  error: string | null;
}

interface ContentActions {
  loadContent: () => Promise<void>;
  getSentenceById: (id: string) => Sentence | undefined;
  getSentencesByCategory: (categoryId: string) => readonly Sentence[];
  getCategoryById: (id: string) => Category | undefined;
  getLevelById: (id: string) => Level | undefined;
}

type ContentStore = ContentState & ContentActions;

export const useContentStore = create<ContentStore>((set, get) => ({
  levels: [],
  categories: [],
  sentences: [],
  isLoading: false,
  error: null,

  loadContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const [levels, categories, sentences] = await Promise.all([
        localContentRepository.getAllLevels(),
        localContentRepository.getAllCategories(),
        localContentRepository.getAllSentences(),
      ]);
      set({ levels, categories, sentences, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content';
      set({ error: message, isLoading: false });
    }
  },

  getSentenceById: (id: string) => {
    return get().sentences.find((s) => s.id === id);
  },

  getSentencesByCategory: (categoryId: string) => {
    return get().sentences.filter((s) => s.categoryId === categoryId);
  },

  getCategoryById: (id: string) => {
    return get().categories.find((c) => c.id === id);
  },

  getLevelById: (id: string) => {
    return get().levels.find((l) => l.id === id);
  },
}));

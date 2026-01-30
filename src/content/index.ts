export { LEVELS, getLevelById, getLevelByNumber } from './levels';
export { CATEGORIES, getCategoryById, getCategoriesByLevelId } from './categories';
export { CAFE_SENTENCES } from './sentences/l1_cafe';
export { TRANSPORT_SENTENCES } from './sentences/l1_transport';

import { CAFE_SENTENCES } from './sentences/l1_cafe';
import { TRANSPORT_SENTENCES } from './sentences/l1_transport';
import type { Sentence } from '../types';

export const ALL_SENTENCES: readonly Sentence[] = [
  ...CAFE_SENTENCES,
  ...TRANSPORT_SENTENCES,
] as const;

export function getSentenceById(sentenceId: string): Sentence | null {
  return ALL_SENTENCES.find((sentence) => sentence.id === sentenceId) ?? null;
}

export function getSentencesByCategory(categoryId: string): readonly Sentence[] {
  return ALL_SENTENCES.filter((sentence) => sentence.categoryId === categoryId);
}

export function getSentencesByLevel(level: 1 | 2 | 3): readonly Sentence[] {
  return ALL_SENTENCES.filter((sentence) => sentence.level === level);
}

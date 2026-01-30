export { LEVELS, getLevelById, getLevelByNumber } from './levels';
export { CATEGORIES, getCategoryById, getCategoriesByLevelId } from './categories';

// Level 1 sentences
export { CAFE_SENTENCES } from './sentences/l1_cafe';
export { TRANSPORT_SENTENCES } from './sentences/l1_transport';
export { SHOPPING_SENTENCES } from './sentences/l1_shopping';
export { HOTEL_SENTENCES } from './sentences/l1_hotel';
export { TOURIST_SENTENCES } from './sentences/l1_tourist';
export { EMERGENCY_SENTENCES } from './sentences/l1_emergency';

// Level 2 sentences
export { GREETING_SENTENCES } from './sentences/l2_greeting';
export { WEATHER_SENTENCES } from './sentences/l2_weather';
export { HOBBY_SENTENCES } from './sentences/l2_hobby';
export { FOOD_SENTENCES } from './sentences/l2_food';

import { CAFE_SENTENCES } from './sentences/l1_cafe';
import { TRANSPORT_SENTENCES } from './sentences/l1_transport';
import { SHOPPING_SENTENCES } from './sentences/l1_shopping';
import { HOTEL_SENTENCES } from './sentences/l1_hotel';
import { TOURIST_SENTENCES } from './sentences/l1_tourist';
import { EMERGENCY_SENTENCES } from './sentences/l1_emergency';
import { GREETING_SENTENCES } from './sentences/l2_greeting';
import { WEATHER_SENTENCES } from './sentences/l2_weather';
import { HOBBY_SENTENCES } from './sentences/l2_hobby';
import { FOOD_SENTENCES } from './sentences/l2_food';
import type { Sentence } from '../types';

export const ALL_SENTENCES: readonly Sentence[] = [
  // Level 1
  ...CAFE_SENTENCES,
  ...TRANSPORT_SENTENCES,
  ...SHOPPING_SENTENCES,
  ...HOTEL_SENTENCES,
  ...TOURIST_SENTENCES,
  ...EMERGENCY_SENTENCES,
  // Level 2
  ...GREETING_SENTENCES,
  ...WEATHER_SENTENCES,
  ...HOBBY_SENTENCES,
  ...FOOD_SENTENCES,
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

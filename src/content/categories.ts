import type { Category } from '../types';

export const CATEGORIES: readonly Category[] = [
  {
    id: 'l1_cafe',
    name: '카페/음식점',
    description: '커피숍과 식당에서 주문하기',
    levelId: 'level_1',
    icon: '☕',
    order: 1,
    sentenceCount: 10,
    keyPatterns: ['~ください', '~ありますか', '~お願いします'],
  },
  {
    id: 'l1_transport',
    name: '교통',
    description: '전철, 버스, 택시 이용하기',
    levelId: 'level_1',
    icon: '🚃',
    order: 2,
    sentenceCount: 10,
    keyPatterns: ['~に行きたい', '~はどこですか', '~まで'],
  },
  {
    id: 'l1_shopping',
    name: '쇼핑',
    description: '가게에서 물건 사기',
    levelId: 'level_1',
    icon: '🛍️',
    order: 3,
    sentenceCount: 10,
    keyPatterns: ['~はいくらですか', '~を見せてください', '~がほしい'],
  },
] as const;

export function getCategoryById(categoryId: string): Category | null {
  return CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getCategoriesByLevelId(levelId: string): readonly Category[] {
  return CATEGORIES.filter((category) => category.levelId === levelId);
}

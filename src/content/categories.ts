import type { Category } from '../types';

export const CATEGORIES: readonly Category[] = [
  // Level 1 - 서바이벌
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
  {
    id: 'l1_hotel',
    name: '호텔/숙소',
    description: '체크인, 체크아웃, 서비스 요청',
    levelId: 'level_1',
    icon: '🏨',
    order: 4,
    sentenceCount: 10,
    keyPatterns: ['チェックイン', '~をお願いします', '~はありますか'],
  },
  {
    id: 'l1_tourist',
    name: '관광지',
    description: '관광명소, 사진촬영, 입장권',
    levelId: 'level_1',
    icon: '🗼',
    order: 5,
    sentenceCount: 10,
    keyPatterns: ['写真を撮って', '~はどこですか', '入場料'],
  },
  {
    id: 'l1_emergency',
    name: '긴급상황',
    description: '길 잃음, 분실, 아플 때',
    levelId: 'level_1',
    icon: '🆘',
    order: 6,
    sentenceCount: 10,
    keyPatterns: ['助けて', '~をなくしました', '病院'],
  },
  // Level 2 - 스몰토크
  {
    id: 'l2_greeting',
    name: '인사/자기소개',
    description: '처음 만남, 인사, 자기소개',
    levelId: 'level_2',
    icon: '👋',
    order: 1,
    sentenceCount: 10,
    keyPatterns: ['はじめまして', '~と申します', '~から来ました'],
  },
  {
    id: 'l2_weather',
    name: '날씨/계절',
    description: '날씨 이야기, 계절 표현',
    levelId: 'level_2',
    icon: '🌤️',
    order: 2,
    sentenceCount: 10,
    keyPatterns: ['今日は~ですね', '~になりました', '~が好きです'],
  },
  {
    id: 'l2_hobby',
    name: '취미/관심사',
    description: '취미, 좋아하는 것 이야기',
    levelId: 'level_2',
    icon: '🎯',
    order: 3,
    sentenceCount: 10,
    keyPatterns: ['趣味は~です', '~が好きです', '~をしています'],
  },
  {
    id: 'l2_food',
    name: '음식/맛',
    description: '음식 추천, 맛 표현',
    levelId: 'level_2',
    icon: '🍱',
    order: 4,
    sentenceCount: 10,
    keyPatterns: ['おすすめは', '~が美味しい', '~を食べたことがありますか'],
  },
] as const;

export function getCategoryById(categoryId: string): Category | null {
  return CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getCategoriesByLevelId(levelId: string): readonly Category[] {
  return CATEGORIES.filter((category) => category.levelId === levelId);
}

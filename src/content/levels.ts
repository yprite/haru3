import type { Level } from '../types';

export const LEVELS: readonly Level[] = [
  {
    id: 'level_1',
    number: 1,
    name: '서바이벌',
    description: '일본 여행에서 꼭 필요한 기초 표현',
    order: 1,
    totalSentences: 30,
    icon: '🌱',
    color: '#4CAF50',
  },
  {
    id: 'level_2',
    number: 2,
    name: '스몰토크',
    description: '일상 대화를 위한 중급 표현',
    order: 2,
    totalSentences: 40,
    icon: '🌿',
    color: '#2196F3',
  },
  {
    id: 'level_3',
    number: 3,
    name: '네이티브',
    description: '자연스러운 표현과 문화적 뉘앙스',
    order: 3,
    totalSentences: 50,
    icon: '🌳',
    color: '#9C27B0',
  },
] as const;

export function getLevelById(levelId: string): Level | null {
  return LEVELS.find((level) => level.id === levelId) ?? null;
}

export function getLevelByNumber(number: 1 | 2 | 3): Level | null {
  return LEVELS.find((level) => level.number === number) ?? null;
}

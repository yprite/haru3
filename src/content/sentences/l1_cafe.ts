import type { Sentence } from '../../types';

export const CAFE_SENTENCES: readonly Sentence[] = [
  {
    id: 'l1_cafe_001',
    jp: 'すみません、アイスコーヒーをください。',
    kana: 'すみません、アイスコーヒーをください。',
    kr: '저기요, 아이스커피 주세요.',
    roman: 'Sumimasen, aisu koohii wo kudasai.',
    chunks: [
      { jp: 'すみません', kana: 'すみません', kr: '저기요', roman: 'sumimasen' },
      {
        jp: 'アイスコーヒーを',
        kana: 'アイスコーヒーを',
        kr: '아이스커피를',
        roman: 'aisu koohii wo',
      },
      { jp: 'ください', kana: 'ください', kr: '주세요', roman: 'kudasai' },
    ],
    keywords: [
      { jp: 'コーヒー', kana: 'コーヒー', kr: '커피', icon: '☕' },
      { jp: 'ください', kana: 'ください', kr: '주세요', icon: '🙏' },
    ],
    categoryId: 'l1_cafe',
    level: 1,
    order: 1,
    tip: 'ください는 "~해주세요"의 가장 기본적인 표현이에요!',
  },
  {
    id: 'l1_cafe_002',
    jp: 'ホットコーヒーはありますか？',
    kana: 'ホットコーヒーはありますか？',
    kr: '따뜻한 커피 있나요?',
    roman: 'Hotto koohii wa arimasu ka?',
    chunks: [
      {
        jp: 'ホットコーヒーは',
        kana: 'ホットコーヒーは',
        kr: '따뜻한 커피는',
        roman: 'hotto koohii wa',
      },
      { jp: 'ありますか', kana: 'ありますか', kr: '있나요', roman: 'arimasu ka' },
    ],
    keywords: [
      { jp: 'ホット', kana: 'ホット', kr: '따뜻한', icon: '🔥' },
      { jp: 'あります', kana: 'あります', kr: '있습니다', icon: '✓' },
    ],
    categoryId: 'l1_cafe',
    level: 1,
    order: 2,
    tip: '~ありますか?는 "~있나요?"로 물건의 유무를 물을 때 사용해요.',
  },
  {
    id: 'l1_cafe_003',
    jp: 'お会計お願いします。',
    kana: 'おかいけいおねがいします。',
    kr: '계산해 주세요.',
    roman: 'Okaikei onegaishimasu.',
    chunks: [
      { jp: 'お会計', kana: 'おかいけい', kr: '계산', roman: 'okaikei' },
      {
        jp: 'お願いします',
        kana: 'おねがいします',
        kr: '부탁합니다',
        roman: 'onegaishimasu',
      },
    ],
    keywords: [
      { jp: '会計', kana: 'かいけい', kr: '계산', icon: '💰' },
      { jp: 'お願いします', kana: 'おねがいします', kr: '부탁합니다', icon: '🙏' },
    ],
    categoryId: 'l1_cafe',
    level: 1,
    order: 3,
    tip: 'お願いします는 ください보다 더 정중한 표현이에요.',
  },
] as const;

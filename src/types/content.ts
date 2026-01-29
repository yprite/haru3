/**
 * IamInJapan - Content Type Definitions
 *
 * 뇌과학 기반 일본어 학습 앱의 핵심 콘텐츠 타입 정의
 */

/**
 * 문장의 청크(덩어리) 단위
 * Chunking 학습 원칙에 따라 문장을 2~4개의 의미 단위로 분해
 */
export interface Chunk {
  /** 일본어 원문 (청크) */
  jp: string;
  /** 히라가나/카타카나 표기 */
  kana: string;
  /** 한국어 뜻 */
  kr: string;
  /** 로마자 발음 */
  roman: string;
}

/**
 * SRS(Spaced Repetition System) 단계
 * Spacing Effect 원칙에 따른 복습 간격
 */
export type SRSStage = 0 | 1 | 2 | 3 | 4;

/**
 * SRS 복습 간격 (일 단위)
 * Stage 0: 학습 직후 (0일)
 * Stage 1: 3일 후
 * Stage 2: 7일 후
 * Stage 3: 14일 후
 * Stage 4: 30일 후 (마스터)
 */
export const SRS_INTERVALS: readonly number[] = [0, 3, 7, 14, 30] as const;

/**
 * 학습 문장 (핵심 학습 단위)
 */
export interface Sentence {
  /**
   * 고유 ID
   * 형식: {levelPrefix}_{categoryShort}_{sequence}
   * 예: l1_cafe_001
   */
  id: string;

  /** 일본어 원문 */
  jp: string;

  /** 히라가나 표기 */
  kana: string;

  /** 한국어 뜻 */
  kr: string;

  /** 로마자 발음 */
  roman: string;

  /**
   * 청크 분해 (Chunking)
   * 문장을 의미 단위로 나눈 배열
   */
  chunks: readonly Chunk[];

  /** 소속 카테고리 ID */
  categoryId: string;

  /** 난이도 레벨 (1, 2, 3) */
  level: 1 | 2 | 3;

  /**
   * 오디오 파일 ID
   * 형식: {sentenceId}_audio
   * MVP에서는 optional
   */
  audioId?: string;

  /**
   * 문장에 포함된 핵심 단어/표현
   * 단어 미니카드 표시용
   */
  keywords?: readonly Keyword[];

  /**
   * 학습 팁 (선택적)
   * Peak-End Rule을 위한 추가 설명
   */
  tip?: string;

  /** 문장 순서 (카테고리 내) */
  order: number;
}

/**
 * 핵심 단어/표현
 */
export interface Keyword {
  /** 일본어 단어 */
  jp: string;
  /** 히라가나 */
  kana: string;
  /** 한국어 뜻 */
  kr: string;
  /** 이모지 아이콘 (시각적 연상) */
  icon?: string;
}

/**
 * 카테고리 (문장 그룹)
 */
export interface Category {
  /**
   * 고유 ID
   * 형식: {levelPrefix}_{categoryName}
   * 예: l1_cafe, l2_family
   */
  id: string;

  /** 카테고리 이름 (한국어) */
  name: string;

  /** 카테고리 설명 */
  description: string;

  /** 소속 레벨 ID */
  levelId: string;

  /** 아이콘 (이모지) */
  icon: string;

  /** 표시 순서 */
  order: number;

  /** 예상 문장 수 */
  sentenceCount: number;

  /**
   * 핵심 문법 패턴
   * 이 카테고리에서 주로 다루는 패턴
   */
  keyPatterns?: readonly string[];
}

/**
 * 레벨 (난이도 단계)
 */
export interface Level {
  /**
   * 고유 ID
   * 형식: level_{number}
   * 예: level_1
   */
  id: string;

  /** 레벨 번호 */
  number: 1 | 2 | 3;

  /** 레벨 이름 */
  name: string;

  /** 레벨 설명 */
  description: string;

  /** 표시 순서 */
  order: number;

  /** 예상 총 문장 수 */
  totalSentences: number;

  /** 아이콘 */
  icon: string;

  /** 색상 테마 (HEX) */
  color: string;
}

/**
 * 데일리 미션 (하루 학습 단위)
 */
export interface DailyMission {
  /** 날짜 (YYYY-MM-DD 형식) */
  date: string;

  /** 오늘 학습할 문장 ID 목록 (기본 3개) */
  sentenceIds: readonly string[];

  /** 복습할 문장 ID 목록 */
  reviewSentenceIds: readonly string[];

  /** 완료 여부 */
  completed: boolean;
}

/**
 * 콘텐츠 매니페스트 (버전 관리)
 */
export interface ContentManifest {
  /** 콘텐츠 버전 */
  version: string;

  /** 마지막 업데이트 일시 */
  lastUpdated: string;

  /** 총 레벨 수 */
  levelCount: number;

  /** 총 카테고리 수 */
  categoryCount: number;

  /** 총 문장 수 */
  sentenceCount: number;
}

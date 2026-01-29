/**
 * IamInJapan - Content Repository Interface
 *
 * Repository Pattern을 사용하여 데이터 소스를 추상화
 * MVP에서는 LocalContentRepository, 향후 RemoteContentRepository로 확장
 */

import type {
  Sentence,
  Category,
  Level,
  DailyMission,
  ContentManifest,
} from '../types';

/**
 * 문장 필터 옵션
 */
export interface SentenceFilter {
  /** 카테고리 ID */
  categoryId?: string;
  /** 레벨 */
  level?: 1 | 2 | 3;
  /** 최대 개수 */
  limit?: number;
  /** 오프셋 */
  offset?: number;
}

/**
 * Content Repository 인터페이스
 *
 * 모든 콘텐츠 데이터 접근을 위한 공통 인터페이스
 * 구현체는 이 인터페이스를 따르므로, 데이터 소스 교체 시 UI/로직 변경 불필요
 */
export interface ContentRepository {
  /**
   * 콘텐츠 매니페스트 조회
   * 버전 정보 및 통계
   */
  getManifest(): Promise<ContentManifest>;

  // ============================================================
  // Level 관련
  // ============================================================

  /**
   * 모든 레벨 조회
   * @returns Level 배열 (order 순 정렬)
   */
  getAllLevels(): Promise<readonly Level[]>;

  /**
   * 특정 레벨 조회
   * @param levelId - 레벨 ID (예: "level_1")
   */
  getLevelById(levelId: string): Promise<Level | null>;

  // ============================================================
  // Category 관련
  // ============================================================

  /**
   * 모든 카테고리 조회
   * @returns Category 배열 (level, order 순 정렬)
   */
  getAllCategories(): Promise<readonly Category[]>;

  /**
   * 레벨별 카테고리 조회
   * @param levelId - 레벨 ID
   */
  getCategoriesByLevel(levelId: string): Promise<readonly Category[]>;

  /**
   * 특정 카테고리 조회
   * @param categoryId - 카테고리 ID (예: "l1_cafe")
   */
  getCategoryById(categoryId: string): Promise<Category | null>;

  // ============================================================
  // Sentence 관련
  // ============================================================

  /**
   * 카테고리별 문장 조회
   * @param categoryId - 카테고리 ID
   */
  getSentencesByCategory(categoryId: string): Promise<readonly Sentence[]>;

  /**
   * 레벨별 문장 조회
   * @param level - 레벨 번호 (1, 2, 3)
   */
  getSentencesByLevel(level: 1 | 2 | 3): Promise<readonly Sentence[]>;

  /**
   * 특정 문장 조회
   * @param sentenceId - 문장 ID (예: "l1_cafe_001")
   */
  getSentenceById(sentenceId: string): Promise<Sentence | null>;

  /**
   * 여러 문장 일괄 조회
   * @param sentenceIds - 문장 ID 배열
   */
  getSentencesByIds(sentenceIds: readonly string[]): Promise<readonly Sentence[]>;

  /**
   * 문장 검색 (필터 적용)
   * @param filter - 검색 필터
   */
  searchSentences(filter: SentenceFilter): Promise<readonly Sentence[]>;

  // ============================================================
  // Daily Mission 관련
  // ============================================================

  /**
   * 오늘의 데일리 미션용 문장 조회
   *
   * Interleaving 원칙에 따라 서로 다른 카테고리/패턴의 문장 반환
   *
   * @param date - 날짜 (YYYY-MM-DD)
   * @param count - 문장 수 (기본: 3)
   * @param excludeIds - 제외할 문장 ID (이미 학습 완료한 문장)
   */
  getDailySentences(
    date: string,
    count?: number,
    excludeIds?: readonly string[]
  ): Promise<readonly Sentence[]>;
}

/**
 * User Progress Repository 인터페이스 (별도 파일로 분리 가능)
 *
 * 사용자 학습 진도 데이터 관리
 */
export interface UserProgressRepository {
  // 향후 구현
}

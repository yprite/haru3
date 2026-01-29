/**
 * IamInJapan - User Progress Type Definitions
 *
 * 사용자 학습 진도 및 SRS 관련 타입
 */

import type { SRSStage } from './content';

/**
 * 회상 자기 평가 결과
 * Retrieval Practice 시 사용자가 선택하는 기억 정도
 */
export type RecallRating = 'forgot' | 'hard' | 'good' | 'easy';

/**
 * 문장별 사용자 학습 진도
 */
export interface UserProgress {
  /** 문장 ID */
  sentenceId: string;

  /**
   * 현재 SRS 단계
   * 0: 신규/리셋, 1: 3일, 2: 7일, 3: 14일, 4: 30일(마스터)
   */
  srsStage: SRSStage;

  /**
   * 다음 복습 예정일 (YYYY-MM-DD)
   * null이면 아직 학습하지 않음
   */
  nextReviewDate: string | null;

  /**
   * 마지막 학습/복습 일시 (ISO 8601)
   */
  lastStudiedAt: string | null;

  /**
   * 총 복습 횟수
   */
  reviewCount: number;

  /**
   * 마스터 완료 일시 (ISO 8601)
   * SRS Stage 4 도달 시 설정
   */
  masteredAt: string | null;

  /**
   * 연속 정답 횟수
   * 틀리면 리셋
   */
  consecutiveCorrect: number;

  /**
   * 총 학습 시도 횟수
   */
  totalAttempts: number;
}

/**
 * 학습 세션 기록
 */
export interface StudySession {
  /** 세션 ID (UUID) */
  id: string;

  /** 세션 시작 시간 */
  startedAt: string;

  /** 세션 종료 시간 */
  endedAt: string | null;

  /** 학습한 문장 ID 목록 */
  sentenceIds: readonly string[];

  /** 복습한 문장 ID 목록 */
  reviewedSentenceIds: readonly string[];

  /** 세션 유형 */
  type: 'daily' | 'review' | 'browse';

  /** 완료 여부 */
  completed: boolean;
}

/**
 * 문장별 세션 내 학습 결과
 */
export interface SentenceSessionResult {
  /** 문장 ID */
  sentenceId: string;

  /** 회상 평가 (선택적 - 복습 시) */
  recallRating?: RecallRating;

  /** 조립 퀴즈 정답 여부 */
  assemblyCorrect: boolean;

  /** 학습 소요 시간 (초) */
  durationSeconds: number;

  /** 스킵 여부 */
  skipped: boolean;
}

/**
 * 사용자 통계
 */
export interface UserStats {
  /** 총 학습 문장 수 (중복 제외) */
  totalSentencesStudied: number;

  /** 마스터한 문장 수 (SRS Stage 4) */
  masteredSentences: number;

  /** 총 학습 세션 수 */
  totalSessions: number;

  /** 총 학습 시간 (분) */
  totalStudyMinutes: number;

  /** 현재 연속 학습 일수 */
  currentStreak: number;

  /** 최장 연속 학습 일수 */
  longestStreak: number;

  /** 마지막 학습일 (YYYY-MM-DD) */
  lastStudyDate: string | null;

  /** 레벨별 진도 */
  levelProgress: readonly LevelProgress[];
}

/**
 * 레벨별 진도
 */
export interface LevelProgress {
  /** 레벨 ID */
  levelId: string;

  /** 학습 완료 문장 수 */
  studiedCount: number;

  /** 마스터 완료 문장 수 */
  masteredCount: number;

  /** 총 문장 수 */
  totalCount: number;

  /** 진도율 (0-100) */
  progressPercent: number;
}

/**
 * 오늘의 복습 대기 목록
 */
export interface ReviewQueue {
  /** 날짜 (YYYY-MM-DD) */
  date: string;

  /** 복습 대기 문장 ID 목록 */
  sentenceIds: readonly string[];

  /** 과거 미복습 문장 ID 목록 (밀린 복습) */
  overdueSentenceIds: readonly string[];
}

/**
 * SRS 업데이트 결과
 */
export interface SRSUpdateResult {
  /** 이전 단계 */
  previousStage: SRSStage;

  /** 새 단계 */
  newStage: SRSStage;

  /** 다음 복습 예정일 */
  nextReviewDate: string;

  /** 마스터 여부 */
  isMastered: boolean;
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  /** 학습 알림 활성화 */
  dailyReminder: boolean;

  /** 학습 알림 시간 (HH:MM) */
  dailyReminderTime: string;

  /** 복습 알림 활성화 */
  reviewReminder: boolean;

  /** 연속 학습 격려 알림 */
  streakReminder: boolean;
}

/**
 * 사용자 설정
 */
export interface UserSettings {
  /** 하루 학습 문장 수 (기본: 3) */
  dailySentenceCount: 3 | 5 | 7;

  /** 음성 자동 재생 */
  autoPlayAudio: boolean;

  /** 음성 재생 속도 */
  audioSpeed: 0.75 | 1.0 | 1.25;

  /** 알림 설정 */
  notifications: NotificationSettings;

  /** 다크 모드 */
  darkMode: boolean | 'system';
}

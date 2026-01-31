/**
 * Lesson Utility Functions
 *
 * 3문장 제한 및 일일 학습 목표 관련 유틸리티
 */
import type { Sentence, UserProgress } from '../types';
import { getToday } from './date';

/**
 * 오늘 학습하지 않은 문장만 필터링
 */
export function getUnlearnedSentences(
  sentences: readonly Sentence[],
  progressMap: Map<string, UserProgress>
): readonly Sentence[] {
  const today = getToday();

  return sentences.filter((sentence) => {
    const progress = progressMap.get(sentence.id);
    if (!progress) return true;

    // 오늘 학습한 문장은 제외
    const lastStudiedDate = progress.lastStudiedAt?.split('T')[0];
    return lastStudiedDate !== today;
  }).sort((a, b) => a.order - b.order);
}

/**
 * 일일 학습 목표만큼 문장 가져오기
 */
export function getDailySentenceBatch(
  sentences: readonly Sentence[],
  progressMap: Map<string, UserProgress>,
  dailyLimit: number
): readonly Sentence[] {
  const unlearned = getUnlearnedSentences(sentences, progressMap);
  return unlearned.slice(0, dailyLimit);
}

/**
 * 일일 목표 달성 여부 확인
 */
export function isDailyGoalReached(
  progressMap: Map<string, UserProgress>,
  dailyGoal: number
): boolean {
  const todayCount = getTodayStudiedCount(progressMap);
  return todayCount >= dailyGoal;
}

/**
 * 오늘 학습한 문장 수 계산
 */
export function getTodayStudiedCount(
  progressMap: Map<string, UserProgress>
): number {
  const today = getToday();
  let count = 0;

  for (const progress of progressMap.values()) {
    if (progress.lastStudiedAt) {
      const studiedDate = progress.lastStudiedAt.split('T')[0];
      if (studiedDate === today) {
        count += 1;
      }
    }
  }

  return count;
}

/**
 * 세션에 로드할 문장 결정
 * - 오늘 학습하지 않은 문장 중
 * - dailyLimit 개수만큼
 * - 해당 카테고리 우선
 */
export function getSessionSentences(
  categorySentences: readonly Sentence[],
  progressMap: Map<string, UserProgress>,
  dailyLimit: number
): readonly Sentence[] {
  const alreadyStudiedToday = getTodayStudiedCount(progressMap);
  const remaining = Math.max(0, dailyLimit - alreadyStudiedToday);

  if (remaining === 0) {
    return [];
  }

  return getDailySentenceBatch(categorySentences, progressMap, remaining);
}

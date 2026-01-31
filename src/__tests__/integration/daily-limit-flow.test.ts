/**
 * Daily Limit Integration Tests
 *
 * 3문장 제한 전체 플로우 통합 테스트
 */
import {
  getUnlearnedSentences,
  getDailySentenceBatch,
  isDailyGoalReached,
  getTodayStudiedCount,
  getSessionSentences,
} from '../../utils/lessonUtils';
import type { Sentence, UserProgress } from '../../types';

describe('Daily Limit Integration Flow', () => {
  const mockSentences: Sentence[] = Array.from({ length: 10 }, (_, i) => ({
    id: `l1_cafe_00${i + 1}`,
    jp: `日本語${i + 1}`,
    kana: `にほんご${i + 1}`,
    kr: `한국어${i + 1}`,
    roman: `nihongo${i + 1}`,
    chunks: [{ jp: `日本語${i + 1}`, kana: `にほんご${i + 1}`, kr: `한국어${i + 1}`, roman: `nihongo${i + 1}` }],
    categoryId: 'l1_cafe',
    level: 1 as const,
    order: i + 1,
  }));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  describe('Scenario: Fresh start (no progress)', () => {
    it('should return first 3 sentences for session', () => {
      const progressMap = new Map<string, UserProgress>();

      const session = getSessionSentences(mockSentences, progressMap, 3);

      expect(session).toHaveLength(3);
      expect(session[0].id).toBe('l1_cafe_001');
      expect(session[1].id).toBe('l1_cafe_002');
      expect(session[2].id).toBe('l1_cafe_003');
    });

    it('should report daily goal not reached', () => {
      const progressMap = new Map<string, UserProgress>();

      expect(isDailyGoalReached(progressMap, 3)).toBe(false);
      expect(getTodayStudiedCount(progressMap)).toBe(0);
    });
  });

  describe('Scenario: Partially completed today', () => {
    it('should return remaining sentences for daily goal', () => {
      const progressMap = new Map<string, UserProgress>();

      // 오늘 1문장 학습 완료
      progressMap.set('l1_cafe_001', {
        sentenceId: 'l1_cafe_001',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: `${today}T10:00:00.000Z`,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      const session = getSessionSentences(mockSentences, progressMap, 3);

      // 오늘 이미 1문장 했으므로 2문장만 더 학습
      expect(session).toHaveLength(2);
      expect(session[0].id).toBe('l1_cafe_002');
      expect(session[1].id).toBe('l1_cafe_003');
    });

    it('should report correct today count', () => {
      const progressMap = new Map<string, UserProgress>();

      progressMap.set('l1_cafe_001', {
        sentenceId: 'l1_cafe_001',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: `${today}T10:00:00.000Z`,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      expect(getTodayStudiedCount(progressMap)).toBe(1);
      expect(isDailyGoalReached(progressMap, 3)).toBe(false);
    });
  });

  describe('Scenario: Daily goal already reached', () => {
    it('should return empty session when 3 sentences studied today', () => {
      const progressMap = new Map<string, UserProgress>();

      // 오늘 3문장 학습 완료
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id, i) => {
        progressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${today}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      const session = getSessionSentences(mockSentences, progressMap, 3);

      expect(session).toHaveLength(0);
    });

    it('should report daily goal reached', () => {
      const progressMap = new Map<string, UserProgress>();

      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id, i) => {
        progressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${today}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      expect(getTodayStudiedCount(progressMap)).toBe(3);
      expect(isDailyGoalReached(progressMap, 3)).toBe(true);
    });
  });

  describe('Scenario: Continue learning after goal', () => {
    it('should get next batch of 3 sentences', () => {
      const progressMap = new Map<string, UserProgress>();

      // 오늘 3문장 학습 완료
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id, i) => {
        progressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${today}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      // 추가 학습을 위해 다음 배치 가져오기
      const unlearned = getUnlearnedSentences(mockSentences, progressMap);
      const nextBatch = getDailySentenceBatch(unlearned, new Map(), 3);

      expect(nextBatch).toHaveLength(3);
      expect(nextBatch[0].id).toBe('l1_cafe_004');
      expect(nextBatch[1].id).toBe('l1_cafe_005');
      expect(nextBatch[2].id).toBe('l1_cafe_006');
    });
  });

  describe('Scenario: Yesterday progress should not affect today count', () => {
    it('should not count yesterday studies for today goal', () => {
      const progressMap = new Map<string, UserProgress>();

      // 어제 3문장 학습 완료
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id, i) => {
        progressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${yesterday}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      expect(getTodayStudiedCount(progressMap)).toBe(0);
      expect(isDailyGoalReached(progressMap, 3)).toBe(false);
    });

    it('should include yesterday sentences in today session (can be restudied)', () => {
      const progressMap = new Map<string, UserProgress>();

      // 어제 3문장 학습 완료
      ['l1_cafe_001', 'l1_cafe_002', 'l1_cafe_003'].forEach((id, i) => {
        progressMap.set(id, {
          sentenceId: id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${yesterday}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      // 어제 학습한 문장도 오늘 다시 학습 가능 (오늘 학습 기록이 없으므로)
      const session = getSessionSentences(mockSentences, progressMap, 3);

      expect(session).toHaveLength(3);
      // 어제 학습한 문장부터 다시 시작 (오늘 학습 기록 없음)
      expect(session[0].id).toBe('l1_cafe_001');
      expect(session[1].id).toBe('l1_cafe_002');
      expect(session[2].id).toBe('l1_cafe_003');
    });
  });

  describe('Scenario: Mixed today and yesterday progress', () => {
    it('should correctly count only today studies', () => {
      const progressMap = new Map<string, UserProgress>();

      // 어제 2문장, 오늘 1문장
      progressMap.set('l1_cafe_001', {
        sentenceId: 'l1_cafe_001',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: `${yesterday}T10:00:00.000Z`,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      progressMap.set('l1_cafe_002', {
        sentenceId: 'l1_cafe_002',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: `${yesterday}T11:00:00.000Z`,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      progressMap.set('l1_cafe_003', {
        sentenceId: 'l1_cafe_003',
        srsStage: 1,
        nextReviewDate: '2025-02-01',
        lastStudiedAt: `${today}T10:00:00.000Z`,
        reviewCount: 1,
        masteredAt: null,
        consecutiveCorrect: 1,
        totalAttempts: 1,
      });

      expect(getTodayStudiedCount(progressMap)).toBe(1);
      expect(isDailyGoalReached(progressMap, 3)).toBe(false);

      // 오늘 2문장 더 학습해야 함 (어제 학습한 문장 중 오늘 안 한 것 포함)
      const session = getSessionSentences(mockSentences, progressMap, 3);
      expect(session).toHaveLength(2);
      // 어제 학습했지만 오늘 아직 안 한 문장들
      expect(session[0].id).toBe('l1_cafe_001');
      expect(session[1].id).toBe('l1_cafe_002');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sentence list', () => {
      const progressMap = new Map<string, UserProgress>();

      const session = getSessionSentences([], progressMap, 3);

      expect(session).toHaveLength(0);
    });

    it('should handle dailyLimit of 0', () => {
      const progressMap = new Map<string, UserProgress>();

      const session = getSessionSentences(mockSentences, progressMap, 0);

      expect(session).toHaveLength(0);
      expect(isDailyGoalReached(progressMap, 0)).toBe(true);
    });

    it('should handle all sentences already learned today', () => {
      const progressMap = new Map<string, UserProgress>();

      // 모든 문장 학습 완료 (오늘)
      mockSentences.forEach((s, i) => {
        progressMap.set(s.id, {
          sentenceId: s.id,
          srsStage: 1,
          nextReviewDate: '2025-02-01',
          lastStudiedAt: `${today}T${10 + i}:00:00.000Z`,
          reviewCount: 1,
          masteredAt: null,
          consecutiveCorrect: 1,
          totalAttempts: 1,
        });
      });

      // 오늘 학습할 새 문장이 없음 (모두 오늘 학습됨)
      const session = getSessionSentences(mockSentences, progressMap, 3);
      expect(session).toHaveLength(0);
    });
  });
});

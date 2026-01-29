import { useCallback, useEffect, useState } from 'react';
import { useProgressStore, useContentStore, useSessionStore } from '../stores';
import type { Sentence } from '../types';

export function useReview() {
  const { reviewQueue, loadReviewQueue } = useProgressStore();
  const { sentences } = useContentStore();
  const { startSession, isSessionActive } = useSessionStore();
  const [reviewSentences, setReviewSentences] = useState<readonly Sentence[]>([]);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  useEffect(() => {
    if (reviewQueue.length > 0 && sentences.length > 0) {
      const queueSet = new Set(reviewQueue);
      const filtered = sentences.filter((s) => queueSet.has(s.id));
      setReviewSentences(filtered);
    } else {
      setReviewSentences([]);
    }
  }, [reviewQueue, sentences]);

  const startReviewSession = useCallback(() => {
    if (reviewSentences.length > 0) {
      startSession(reviewSentences);
    }
  }, [reviewSentences, startSession]);

  const reviewCount = reviewSentences.length;
  const hasReviews = reviewCount > 0;

  return {
    reviewSentences,
    reviewCount,
    hasReviews,
    startReviewSession,
    isSessionActive,
    refreshQueue: loadReviewQueue,
  };
}

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSessionStore, useProgressStore, useContentStore } from '../stores';
import type { RecallRating } from '../types';
import { useSpeech } from './useSpeech';
import { getSessionSentences, getTodayStudiedCount, isDailyGoalReached } from '../utils/lessonUtils';

const DEFAULT_DAILY_LIMIT = 3;

export function useLesson(sentenceId?: string) {
  const {
    currentSentence,
    currentStep,
    stepIndex,
    sentenceQueue,
    queueIndex,
    isSessionActive,
    assemblyAnswer,
    recallRating,
    startSession,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setAssemblyAnswer,
    setRecallRating,
    goToNextSentence,
    endSession,
    addMoreSentences,
  } = useSessionStore();

  const { updateAfterReview, incrementStudyTime, settings, progressMap } = useProgressStore();
  const { getSentenceById, getSentencesByCategory } = useContentStore();

  const { speak, stop, isSpeaking } = useSpeech();

  const dailyLimit = settings?.dailySentenceCount ?? DEFAULT_DAILY_LIMIT;

  // Ref to avoid infinite loop with progressMap in useEffect
  const progressMapRef = useRef(progressMap);
  progressMapRef.current = progressMap;

  const dailyLimitRef = useRef(dailyLimit);
  dailyLimitRef.current = dailyLimit;

  // 세션 시작 시 3문장만 로드
  useEffect(() => {
    if (sentenceId && !isSessionActive) {
      const sentence = getSentenceById(sentenceId);
      if (sentence) {
        const categorySentences = getSentencesByCategory(sentence.categoryId);
        // 3문장 제한 적용
        const sessionSentences = getSessionSentences(
          categorySentences,
          progressMapRef.current,
          dailyLimitRef.current
        );

        if (sessionSentences.length > 0) {
          startSession(sessionSentences);
        } else {
          // 오늘 이미 목표 달성 - 첫 번째 문장부터 시작 (추가 학습)
          const sortedSentences = [...categorySentences].sort((a, b) => a.order - b.order);
          startSession(sortedSentences.slice(0, dailyLimitRef.current));
        }
      }
    }
  }, [sentenceId, isSessionActive, getSentenceById, getSentencesByCategory, startSession]);

  const speakCurrentSentence = useCallback(() => {
    if (currentSentence) {
      speak(currentSentence.jp);
    }
  }, [currentSentence, speak]);

  const speakText = useCallback(
    (text: string) => {
      speak(text);
    },
    [speak]
  );

  const checkAssemblyAnswer = useCallback((): boolean => {
    if (!currentSentence) return false;
    const correctOrder = currentSentence.chunks.map((c) => c.jp);
    if (assemblyAnswer.length !== correctOrder.length) return false;
    return assemblyAnswer.every((chunk, index) => chunk === correctOrder[index]);
  }, [currentSentence, assemblyAnswer]);

  // 진도만 저장 (다음 단계 이동은 하지 않음)
  const saveProgress = useCallback(async () => {
    if (!currentSentence || !recallRating) return;
    await updateAfterReview(currentSentence.id, recallRating);
  }, [currentSentence, recallRating, updateAfterReview]);

  // 다음 문장으로 이동 (StepComplete에서 호출)
  const moveToNextSentence = useCallback(() => {
    return goToNextSentence();
  }, [goToNextSentence]);

  // 세션 종료 (StepComplete에서 호출)
  const finishSession = useCallback(async () => {
    const { durationMinutes } = endSession();
    if (durationMinutes > 0) {
      await incrementStudyTime(durationMinutes);
    }
  }, [endSession, incrementStudyTime]);

  // 추가 문장 로드 (더 학습하기)
  const loadMoreSentences = useCallback(() => {
    if (!currentSentence) return false;

    const categorySentences = getSentencesByCategory(currentSentence.categoryId);
    const additionalSentences = getSessionSentences(
      categorySentences,
      progressMapRef.current,
      dailyLimitRef.current
    );

    if (additionalSentences.length > 0) {
      addMoreSentences(additionalSentences);
      return true;
    }

    return false;
  }, [currentSentence, getSentencesByCategory, addMoreSentences]);

  // 오늘 학습 현황
  const todayStudiedCount = useMemo(() => {
    return getTodayStudiedCount(progressMap);
  }, [progressMap]);

  const dailyGoalReached = useMemo(() => {
    return isDailyGoalReached(progressMap, dailyLimit);
  }, [progressMap, dailyLimit]);

  // 현재 세션에서 몇 번째 문장인지
  const sessionSentenceIndex = queueIndex + 1;

  // 세션의 마지막 문장인지
  const isLastSentenceInBatch = queueIndex >= sentenceQueue.length - 1;

  const totalSteps = 7;
  const totalSentences = sentenceQueue.length;
  const currentSentenceIndex = queueIndex + 1;
  const isLastStep = currentStep === 'complete';
  const isFirstStep = currentStep === 'listen';

  return {
    currentSentence,
    currentStep,
    stepIndex,
    totalSteps,
    totalSentences,
    currentSentenceIndex,
    isSessionActive,
    isLastStep,
    isFirstStep,
    assemblyAnswer,
    recallRating,
    isSpeaking,
    speakCurrentSentence,
    speakText,
    stopSpeaking: stop,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setAssemblyAnswer,
    setRecallRating,
    checkAssemblyAnswer,
    saveProgress,
    moveToNextSentence,
    finishSession,
    startSession,
    endSession,
    // 3문장 제한 기능
    loadMoreSentences,
    todayStudiedCount,
    dailyGoalReached,
    dailyLimit,
    sessionSentenceIndex,
    isLastSentenceInBatch,
  };
}

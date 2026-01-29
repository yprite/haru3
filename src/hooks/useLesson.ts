import { useCallback, useEffect } from 'react';
import { useSessionStore, useProgressStore, useContentStore } from '../stores';
import type { RecallRating, Sentence } from '../types';
import { useSpeech } from './useSpeech';

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
  } = useSessionStore();

  const { updateAfterReview, incrementStudyTime } = useProgressStore();
  const { getSentenceById, getSentencesByCategory } = useContentStore();

  const { speak, stop, isSpeaking } = useSpeech();

  useEffect(() => {
    if (sentenceId && !isSessionActive) {
      const sentence = getSentenceById(sentenceId);
      if (sentence) {
        const categorySentences = getSentencesByCategory(sentence.categoryId);
        startSession(categorySentences);
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
  };
}

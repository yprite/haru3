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

  const completeCurrentSentence = useCallback(async () => {
    if (!currentSentence || !recallRating) return;

    await updateAfterReview(currentSentence.id, recallRating);

    const hasNext = goToNextSentence();
    if (!hasNext) {
      const { durationMinutes } = endSession();
      if (durationMinutes > 0) {
        await incrementStudyTime(durationMinutes);
      }
    }
  }, [
    currentSentence,
    recallRating,
    updateAfterReview,
    goToNextSentence,
    endSession,
    incrementStudyTime,
  ]);

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
    completeCurrentSentence,
    startSession,
    endSession,
  };
}

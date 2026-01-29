import { create } from 'zustand';
import type { Sentence, RecallRating } from '../types';

export type LessonStep =
  | 'listen'
  | 'chunk'
  | 'words'
  | 'speak'
  | 'recall'
  | 'assembly'
  | 'complete';

const LESSON_STEPS: readonly LessonStep[] = [
  'listen',
  'chunk',
  'words',
  'speak',
  'recall',
  'assembly',
  'complete',
] as const;

interface SessionState {
  currentSentence: Sentence | null;
  currentStep: LessonStep;
  stepIndex: number;
  sentenceQueue: readonly Sentence[];
  queueIndex: number;
  sessionStartTime: number | null;
  isSessionActive: boolean;
  assemblyAnswer: readonly string[];
  recallRating: RecallRating | null;
}

interface SessionActions {
  startSession: (sentences: readonly Sentence[]) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: LessonStep) => void;
  setAssemblyAnswer: (answer: readonly string[]) => void;
  setRecallRating: (rating: RecallRating) => void;
  goToNextSentence: () => boolean;
  endSession: () => { durationMinutes: number };
  resetSession: () => void;
}

type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  currentSentence: null,
  currentStep: 'listen',
  stepIndex: 0,
  sentenceQueue: [],
  queueIndex: 0,
  sessionStartTime: null,
  isSessionActive: false,
  assemblyAnswer: [],
  recallRating: null,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  startSession: (sentences: readonly Sentence[]) => {
    if (sentences.length === 0) return;
    set({
      sentenceQueue: sentences,
      queueIndex: 0,
      currentSentence: sentences[0],
      currentStep: 'listen',
      stepIndex: 0,
      sessionStartTime: Date.now(),
      isSessionActive: true,
      assemblyAnswer: [],
      recallRating: null,
    });
  },

  goToNextStep: () => {
    const { stepIndex, currentStep } = get();
    if (currentStep === 'complete') return;
    const nextIndex = stepIndex + 1;
    if (nextIndex < LESSON_STEPS.length) {
      set({
        stepIndex: nextIndex,
        currentStep: LESSON_STEPS[nextIndex],
      });
    }
  },

  goToPreviousStep: () => {
    const { stepIndex } = get();
    if (stepIndex <= 0) return;
    const prevIndex = stepIndex - 1;
    set({
      stepIndex: prevIndex,
      currentStep: LESSON_STEPS[prevIndex],
    });
  },

  goToStep: (step: LessonStep) => {
    const index = LESSON_STEPS.indexOf(step);
    if (index >= 0) {
      set({
        stepIndex: index,
        currentStep: step,
      });
    }
  },

  setAssemblyAnswer: (answer: readonly string[]) => {
    set({ assemblyAnswer: answer });
  },

  setRecallRating: (rating: RecallRating) => {
    set({ recallRating: rating });
  },

  goToNextSentence: () => {
    const { sentenceQueue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex >= sentenceQueue.length) {
      return false;
    }
    set({
      queueIndex: nextIndex,
      currentSentence: sentenceQueue[nextIndex],
      currentStep: 'listen',
      stepIndex: 0,
      assemblyAnswer: [],
      recallRating: null,
    });
    return true;
  },

  endSession: () => {
    const { sessionStartTime } = get();
    const duration = sessionStartTime ? Date.now() - sessionStartTime : 0;
    const durationMinutes = Math.round(duration / 60000);
    set({ ...initialState });
    return { durationMinutes };
  },

  resetSession: () => {
    set({ ...initialState });
  },
}));

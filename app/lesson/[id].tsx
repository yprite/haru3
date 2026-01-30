import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLesson } from '../../src/hooks';
import { useProgressStore, useSessionStore, useContentStore } from '../../src/stores';
import { Button } from '../../src/components';
import {
  StepListen,
  StepChunk,
  StepWords,
  StepSpeak,
  StepRecall,
  StepAssembly,
  StepComplete,
} from '../../src/components/lesson';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const {
    currentSentence,
    currentStep,
    stepIndex,
    totalSteps,
    currentSentenceIndex,
    totalSentences,
    isSessionActive,
    assemblyAnswer,
    recallRating,
    isSpeaking,
    speakCurrentSentence,
    speakText,
    goToNextStep,
    goToPreviousStep,
    setAssemblyAnswer,
    setRecallRating,
    checkAssemblyAnswer,
    saveProgress,
    moveToNextSentence,
    finishSession,
    endSession,
  } = useLesson(id);

  const { getProgress, progressMap } = useProgressStore();
  const { sentenceQueue, queueIndex } = useSessionStore();
  const { getCategoryById, getSentencesByCategory } = useContentStore();

  useEffect(() => {
    if (!currentSentence) {
      const timer = setTimeout(() => setLoadingTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [currentSentence]);

  const handleClose = () => {
    endSession();
    router.back();
  };

  const handleNextSentence = () => {
    const hasNext = moveToNextSentence();
    if (!hasNext) {
      finishSession();
      router.back();
    }
  };

  const handleFinish = async () => {
    await finishSession();
    router.back();
  };

  if (!currentSentence) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {loadingTimeout ? (
          <>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>문장을 불러올 수 없습니다</Text>
            <Text style={styles.errorSubtext}>학습 콘텐츠를 찾지 못했어요</Text>
            <Button
              title="돌아가기"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </>
        ) : (
          <Text style={styles.loadingText}>문장을 불러오는 중...</Text>
        )}
      </SafeAreaView>
    );
  }

  const progress = getProgress(currentSentence.id);
  const hasNextSentence = queueIndex < sentenceQueue.length - 1;

  const category = getCategoryById(currentSentence.categoryId);
  const categorySentences = getSentencesByCategory(currentSentence.categoryId);
  const learnedCount = categorySentences.filter((s) => progressMap.has(s.id)).length;
  const remainingSentences = categorySentences.length - learnedCount;

  const renderStep = () => {
    switch (currentStep) {
      case 'listen':
        return (
          <StepListen
            sentence={currentSentence}
            onSpeak={speakCurrentSentence}
            onNext={goToNextStep}
            isSpeaking={isSpeaking}
          />
        );
      case 'chunk':
        return (
          <StepChunk
            sentence={currentSentence}
            onSpeak={speakText}
            onNext={goToNextStep}
            onPrev={goToPreviousStep}
          />
        );
      case 'words':
        return (
          <StepWords
            sentence={currentSentence}
            onSpeak={speakText}
            onNext={goToNextStep}
            onPrev={goToPreviousStep}
          />
        );
      case 'speak':
        return (
          <StepSpeak
            sentence={currentSentence}
            onSpeak={speakCurrentSentence}
            onNext={goToNextStep}
            onPrev={goToPreviousStep}
            isSpeaking={isSpeaking}
          />
        );
      case 'recall':
        return (
          <StepRecall
            sentence={currentSentence}
            onSpeak={speakCurrentSentence}
            onNext={goToNextStep}
            onPrev={goToPreviousStep}
            onRatingSelect={setRecallRating}
            selectedRating={recallRating}
          />
        );
      case 'assembly':
        return (
          <StepAssembly
            sentence={currentSentence}
            answer={assemblyAnswer}
            onAnswerChange={setAssemblyAnswer}
            onNext={async () => {
              await saveProgress();
              goToNextStep(); // → complete 단계로 이동
            }}
            onPrev={goToPreviousStep}
            onCheck={checkAssemblyAnswer}
          />
        );
      case 'complete':
        return (
          <StepComplete
            sentence={currentSentence}
            srsStage={progress?.srsStage}
            hasNext={hasNextSentence}
            remainingSentences={remainingSentences}
            categoryName={category?.name ?? '카페'}
            onNextSentence={handleNextSentence}
            onFinish={handleFinish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <Button
              title="닫기"
              onPress={handleClose}
              variant="ghost"
              size="small"
              icon={<Ionicons name="close" size={20} color="#666666" />}
            />
          ),
          headerRight: () => (
            <Text style={styles.progressIndicator}>
              {currentSentenceIndex}/{totalSentences}
            </Text>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index <= stepIndex && styles.stepDotActive,
                index === stepIndex && styles.stepDotCurrent,
              ]}
            />
          ))}
        </View>
        <View style={styles.content}>{renderStep()}</View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    backgroundColor: '#A5D6A7',
  },
  stepDotCurrent: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  content: {
    flex: 1,
  },
  progressIndicator: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});

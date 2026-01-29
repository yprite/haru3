import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';

interface StepAssemblyProps {
  sentence: Sentence;
  answer: readonly string[];
  onAnswerChange: (answer: readonly string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  onCheck: () => boolean;
}

export function StepAssembly({
  sentence,
  answer,
  onAnswerChange,
  onNext,
  onPrev,
  onCheck,
}: StepAssemblyProps) {
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const shuffledChunks = useMemo(() => {
    const chunks = sentence.chunks.map((c) => c.jp);
    return [...chunks].sort(() => Math.random() - 0.5);
  }, [sentence.chunks]);

  const availableChunks = useMemo(() => {
    const usedSet = new Set(answer);
    return shuffledChunks.filter(
      (chunk, index) =>
        !answer.includes(chunk) ||
        shuffledChunks.filter((c, i) => c === chunk && i <= index).length >
          answer.filter((a) => a === chunk).length
    );
  }, [shuffledChunks, answer]);

  const handleChunkSelect = useCallback(
    (chunk: string) => {
      if (showResult) return;
      onAnswerChange([...answer, chunk]);
    },
    [answer, onAnswerChange, showResult]
  );

  const handleChunkRemove = useCallback(
    (index: number) => {
      if (showResult) return;
      const newAnswer = answer.filter((_, i) => i !== index);
      onAnswerChange(newAnswer);
    },
    [answer, onAnswerChange, showResult]
  );

  const handleCheck = () => {
    const result = onCheck();
    setIsCorrect(result);
    setShowResult(true);
  };

  const handleRetry = () => {
    setShowResult(false);
    setIsCorrect(false);
    onAnswerChange([]);
  };

  const canCheck = answer.length === sentence.chunks.length && !showResult;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 6: 조립 퀴즈</Text>
        <Text style={styles.stepDescription}>청크를 순서대로 배열해 문장을 완성하세요</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.questionCard}>
          <Text style={styles.korean}>{sentence.kr}</Text>
        </Card>

        <View style={styles.answerArea}>
          {answer.length === 0 ? (
            <Text style={styles.placeholder}>여기에 청크를 배열하세요</Text>
          ) : (
            <View style={styles.answerChunks}>
              {answer.map((chunk, index) => (
                <Pressable
                  key={`answer-${index}`}
                  style={[
                    styles.chunk,
                    styles.answerChunk,
                    showResult && (isCorrect ? styles.correctChunk : styles.wrongChunk),
                  ]}
                  onPress={() => handleChunkRemove(index)}
                  disabled={showResult}
                >
                  <Text style={styles.chunkText}>{chunk}</Text>
                  {!showResult && (
                    <Ionicons name="close-circle" size={16} color="#666666" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {showResult && (
          <View style={[styles.resultCard, isCorrect ? styles.correctCard : styles.wrongCard]}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? '#4CAF50' : '#F44336'}
            />
            <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.wrongText]}>
              {isCorrect ? '정답입니다!' : '다시 시도해보세요'}
            </Text>
          </View>
        )}

        {!showResult && (
          <View style={styles.chunksPool}>
            {availableChunks.map((chunk, index) => (
              <Pressable
                key={`pool-${index}`}
                style={styles.chunk}
                onPress={() => handleChunkSelect(chunk)}
              >
                <Text style={styles.chunkText}>{chunk}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="이전" onPress={onPrev} variant="outline" size="medium" />
        {showResult ? (
          isCorrect ? (
            <Button title="다음" onPress={onNext} size="medium" style={styles.nextButton} />
          ) : (
            <Button title="다시 시도" onPress={handleRetry} size="medium" style={styles.nextButton} />
          )
        ) : (
          <Button
            title="확인"
            onPress={handleCheck}
            size="medium"
            style={styles.nextButton}
            disabled={!canCheck}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    gap: 16,
  },
  questionCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#E8F5E9',
  },
  korean: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  answerArea: {
    minHeight: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholder: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 15,
  },
  answerChunks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chunksPool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    padding: 8,
  },
  chunk: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerChunk: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  correctChunk: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  wrongChunk: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  chunkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  correctCard: {
    backgroundColor: '#E8F5E9',
  },
  wrongCard: {
    backgroundColor: '#FFEBEE',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctText: {
    color: '#4CAF50',
  },
  wrongText: {
    color: '#F44336',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 20,
    gap: 12,
  },
  nextButton: {
    flex: 1,
  },
});

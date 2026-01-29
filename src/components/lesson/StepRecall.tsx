import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence, RecallRating } from '../../types';
import { Button, Card } from '../common';

interface StepRecallProps {
  sentence: Sentence;
  onSpeak: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRatingSelect: (rating: RecallRating) => void;
  selectedRating: RecallRating | null;
}

const RATINGS: { value: RecallRating; label: string; color: string; icon: string }[] = [
  { value: 'forgot', label: '모르겠어요', color: '#F44336', icon: 'close-circle' },
  { value: 'hard', label: '어려워요', color: '#FF9800', icon: 'help-circle' },
  { value: 'good', label: '알겠어요', color: '#4CAF50', icon: 'checkmark-circle' },
  { value: 'easy', label: '쉬워요!', color: '#2196F3', icon: 'star' },
];

export function StepRecall({
  sentence,
  onSpeak,
  onNext,
  onPrev,
  onRatingSelect,
  selectedRating,
}: StepRecallProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    onSpeak();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 5: 회상하기</Text>
        <Text style={styles.stepDescription}>
          한국어를 보고 일본어를 떠올려보세요
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.questionCard}>
          <Text style={styles.korean}>{sentence.kr}</Text>
        </Card>

        {!revealed ? (
          <Pressable style={styles.hiddenCard} onPress={handleReveal}>
            <Ionicons name="eye-off" size={32} color="#9E9E9E" />
            <Text style={styles.hiddenText}>터치해서 정답 보기</Text>
          </Pressable>
        ) : (
          <>
            <Card style={styles.answerCard}>
              <Text style={styles.japanese}>{sentence.jp}</Text>
              <Text style={styles.roman}>{sentence.roman}</Text>
            </Card>

            <View style={styles.ratingsContainer}>
              <Text style={styles.ratingsTitle}>얼마나 기억나셨나요?</Text>
              <View style={styles.ratings}>
                {RATINGS.map((rating) => (
                  <Pressable
                    key={rating.value}
                    style={[
                      styles.ratingButton,
                      selectedRating === rating.value && {
                        backgroundColor: rating.color,
                      },
                    ]}
                    onPress={() => onRatingSelect(rating.value)}
                  >
                    <Ionicons
                      name={rating.icon as any}
                      size={24}
                      color={selectedRating === rating.value ? '#ffffff' : rating.color}
                    />
                    <Text
                      style={[
                        styles.ratingLabel,
                        selectedRating === rating.value && styles.ratingLabelSelected,
                      ]}
                    >
                      {rating.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="이전" onPress={onPrev} variant="outline" size="medium" />
        <Button
          title="다음"
          onPress={onNext}
          size="medium"
          style={styles.nextButton}
          disabled={!revealed || !selectedRating}
        />
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
    paddingVertical: 24,
    backgroundColor: '#E8F5E9',
  },
  korean: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  hiddenCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  hiddenText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 12,
  },
  answerCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  japanese: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  roman: {
    fontSize: 14,
    color: '#888888',
  },
  ratingsContainer: {
    marginTop: 8,
  },
  ratingsTitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  ratings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  ratingLabelSelected: {
    color: '#ffffff',
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

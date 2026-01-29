import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';

interface StepSpeakProps {
  sentence: Sentence;
  onSpeak: () => void;
  onNext: () => void;
  onPrev: () => void;
  isSpeaking: boolean;
}

export function StepSpeak({
  sentence,
  onSpeak,
  onNext,
  onPrev,
  isSpeaking,
}: StepSpeakProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 4: 따라 말하기</Text>
        <Text style={styles.stepDescription}>
          음성을 듣고 크게 따라 말해보세요
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.sentenceCard}>
          <Text style={styles.japanese}>{sentence.jp}</Text>
          <Text style={styles.kana}>{sentence.kana}</Text>
          <Text style={styles.roman}>{sentence.roman}</Text>
        </Card>

        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>아래 버튼을 눌러 음성을 들으세요</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>발음을 따라 크게 말해보세요</Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>3번 이상 반복하면 더 좋아요!</Text>
          </View>
        </View>

        <Button
          title={isSpeaking ? '재생 중...' : '음성 듣기'}
          onPress={onSpeak}
          variant="primary"
          size="large"
          disabled={isSpeaking}
          icon={
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'play-circle'}
              size={24}
              color="#ffffff"
            />
          }
        />
      </View>

      <View style={styles.footer}>
        <Button title="이전" onPress={onPrev} variant="outline" size="medium" />
        <Button title="다음" onPress={onNext} size="medium" style={styles.nextButton} />
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
    gap: 24,
  },
  sentenceCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  japanese: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  kana: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  roman: {
    fontSize: 14,
    color: '#888888',
  },
  instructions: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
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

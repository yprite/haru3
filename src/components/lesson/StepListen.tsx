import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button } from '../common';

interface StepListenProps {
  sentence: Sentence;
  onSpeak: () => void;
  onNext: () => void;
  isSpeaking: boolean;
}

export function StepListen({
  sentence,
  onSpeak,
  onNext,
  isSpeaking,
}: StepListenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 1: 듣기</Text>
        <Text style={styles.stepDescription}>
          원어민 발음을 집중해서 들어보세요
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sentenceCard}>
          <Text style={styles.korean}>{sentence.kr}</Text>
        </View>

        <Button
          title={isSpeaking ? '재생 중...' : '음성 듣기'}
          onPress={onSpeak}
          variant="secondary"
          size="large"
          disabled={isSpeaking}
          icon={
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'play-circle'}
              size={24}
              color="#4CAF50"
            />
          }
        />
      </View>

      <View style={styles.footer}>
        <Button title="다음" onPress={onNext} size="large" />
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
    marginBottom: 32,
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
    justifyContent: 'center',
    gap: 24,
  },
  sentenceCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  korean: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 32,
  },
  footer: {
    paddingTop: 20,
  },
});

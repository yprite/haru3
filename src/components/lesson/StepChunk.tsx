import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';

interface StepChunkProps {
  sentence: Sentence;
  onSpeak: (text: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepChunk({ sentence, onSpeak, onNext, onPrev }: StepChunkProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 2: 청크 분해</Text>
        <Text style={styles.stepDescription}>
          문장을 의미 단위로 나눠서 이해해요
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.fullSentence}>
          <Text style={styles.japanese}>{sentence.jp}</Text>
          <Text style={styles.roman}>{sentence.roman}</Text>
        </View>

        <View style={styles.chunksContainer}>
          {sentence.chunks.map((chunk, index) => (
            <Card key={index} style={styles.chunkCard}>
              <View style={styles.chunkHeader}>
                <Text style={styles.chunkJapanese}>{chunk.jp}</Text>
                <Button
                  title=""
                  onPress={() => onSpeak(chunk.jp)}
                  variant="ghost"
                  size="small"
                  icon={<Ionicons name="volume-medium" size={20} color="#4CAF50" />}
                />
              </View>
              <Text style={styles.chunkRoman}>{chunk.roman}</Text>
              <Text style={styles.chunkKorean}>{chunk.kr}</Text>
            </Card>
          ))}
        </View>
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
  },
  fullSentence: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  japanese: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  roman: {
    fontSize: 14,
    color: '#666666',
  },
  chunksContainer: {
    gap: 12,
  },
  chunkCard: {
    padding: 16,
  },
  chunkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chunkJapanese: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chunkRoman: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  chunkKorean: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '500',
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

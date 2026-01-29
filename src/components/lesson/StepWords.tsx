import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';

interface StepWordsProps {
  sentence: Sentence;
  onSpeak: (text: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepWords({ sentence, onSpeak, onNext, onPrev }: StepWordsProps) {
  const keywords = sentence.keywords ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Step 3: 단어 카드</Text>
        <Text style={styles.stepDescription}>
          핵심 단어를 익혀보세요
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {keywords.length > 0 ? (
          keywords.map((keyword, index) => (
            <Card key={index} style={styles.wordCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{keyword.icon ?? '📝'}</Text>
              </View>
              <View style={styles.wordInfo}>
                <View style={styles.wordHeader}>
                  <Text style={styles.wordJapanese}>{keyword.jp}</Text>
                  <Button
                    title=""
                    onPress={() => onSpeak(keyword.jp)}
                    variant="ghost"
                    size="small"
                    icon={<Ionicons name="volume-medium" size={20} color="#4CAF50" />}
                  />
                </View>
                <Text style={styles.wordKana}>{keyword.kana}</Text>
                <Text style={styles.wordKorean}>{keyword.kr}</Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>이 문장에는 별도 단어 카드가 없어요</Text>
          </View>
        )}

        {sentence.tip && (
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color="#FFC107" />
              <Text style={styles.tipTitle}>학습 팁</Text>
            </View>
            <Text style={styles.tipText}>{sentence.tip}</Text>
          </Card>
        )}
      </ScrollView>

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
  scrollContent: {
    gap: 12,
    paddingBottom: 20,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  wordInfo: {
    flex: 1,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordJapanese: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  wordKana: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  wordKorean: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
  },
  tipCard: {
    backgroundColor: '#FFF8E1',
    marginTop: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  tipText: {
    fontSize: 15,
    color: '#5D4037',
    lineHeight: 22,
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

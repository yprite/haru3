import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';
import { getStageLabel, getStageColor } from '../../utils/srs';
import type { SRSStage } from '../../types/content';

interface StepCompleteProps {
  sentence: Sentence;
  srsStage?: SRSStage;
  hasNext: boolean;
  onNextSentence: () => void;
  onFinish: () => void;
}

export function StepComplete({
  sentence,
  srsStage,
  hasNext,
  onNextSentence,
  onFinish,
}: StepCompleteProps) {
  const stage = srsStage ?? 0;
  const stageLabel = getStageLabel(stage);
  const stageColor = getStageColor(stage);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.title}>학습 완료!</Text>
          <Text style={styles.subtitle}>이 문장을 훌륭하게 마쳤어요</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.sentenceLabel}>학습한 문장</Text>
          <Text style={styles.japanese}>{sentence.jp}</Text>
          <Text style={styles.korean}>{sentence.kr}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>학습 단계</Text>
              <View style={[styles.stageBadge, { backgroundColor: stageColor }]}>
                <Text style={styles.stageText}>{stageLabel}</Text>
              </View>
            </View>
          </View>
        </Card>

        {sentence.tip && (
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={20} color="#FFC107" />
              <Text style={styles.tipTitle}>오늘의 포인트</Text>
            </View>
            <Text style={styles.tipText}>{sentence.tip}</Text>
          </Card>
        )}
      </View>

      <View style={styles.footer}>
        {hasNext ? (
          <Button
            title="다음 문장 학습"
            onPress={onNextSentence}
            size="large"
            icon={<Ionicons name="arrow-forward" size={20} color="#ffffff" />}
          />
        ) : (
          <Button
            title="학습 종료"
            onPress={onFinish}
            size="large"
            icon={<Ionicons name="home" size={20} color="#ffffff" />}
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
  content: {
    flex: 1,
    gap: 20,
  },
  celebration: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  summaryCard: {
    padding: 20,
  },
  sentenceLabel: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  japanese: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  korean: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
  },
  stageBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFF8E1',
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
    paddingTop: 20,
  },
});

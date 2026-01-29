import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';
import { getStageLabel, getStageColor, calculateNextReview } from '../../utils/srs';
import { formatDate } from '../../utils/date';
import type { SRSStage } from '../../types/content';

interface StepCompleteProps {
  sentence: Sentence;
  srsStage?: SRSStage;
  hasNext: boolean;
  remainingSentences?: number;
  categoryName?: string;
  onNextSentence: () => void;
  onFinish: () => void;
}

export function StepComplete({
  sentence,
  srsStage,
  hasNext,
  remainingSentences = 0,
  categoryName = '카페',
  onNextSentence,
  onFinish,
}: StepCompleteProps) {
  const stage = srsStage ?? 0;
  const stageLabel = getStageLabel(stage);
  const stageColor = getStageColor(stage);
  const nextReviewDate = calculateNextReview(stage);
  const formattedReviewDate = formatDate(nextReviewDate);

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

          <View style={styles.divider} />

          <View style={styles.reviewInfo}>
            <Ionicons name="calendar-outline" size={18} color="#666666" />
            <Text style={styles.reviewText}>
              다음 복습: {formattedReviewDate}
            </Text>
          </View>
          <Text style={styles.reviewHint}>
            그때 복습하면 장기기억으로 저장돼요
          </Text>
        </Card>

        {remainingSentences > 0 && (
          <Card style={styles.progressCard}>
            <Text style={styles.progressText}>
              💬 {remainingSentences}문장 더 배우면{'\n'}
              <Text style={styles.progressHighlight}>{categoryName} 표현 완전 정복</Text>
            </Text>
          </Card>
        )}

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
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  reviewHint: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 15,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressHighlight: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  footer: {
    paddingTop: 20,
  },
});

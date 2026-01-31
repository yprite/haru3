import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Sentence } from '../../types';
import { Button, Card } from '../common';
import { SRSProgressVisual } from '../brain-science';
import { getStageLabel, getStageColor, calculateNextReview } from '../../utils/srs';
import { formatDate } from '../../utils/date';
import type { SRSStage } from '../../types/content';

const SRS_STAGE_MESSAGES: Record<SRSStage, string> = {
  0: '첫 만남! 내일 다시 만나요',
  1: '3일 후, 기억이 흐려지기 직전에 복습해요',
  2: '일주일 후, 단기기억 → 중기기억 전환 중',
  3: '2주 후, 이제 장기기억에 저장되기 시작해요',
  4: '한 달 후 복습으로 평생 기억 완성!',
};

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
          <Text style={styles.subtitle}>뇌에 새로운 연결이 만들어졌어요</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.sentenceLabel}>학습한 문장</Text>
          <Text style={styles.japanese}>{sentence.jp}</Text>
          <Text style={styles.korean}>{sentence.kr}</Text>

          <View style={styles.divider} />

          <View style={styles.srsContainer}>
            <Text style={styles.srsTitle}>기억 강화 단계</Text>
            <SRSProgressVisual currentStage={stage} size="small" showLabels={false} />
          </View>

          <View style={styles.divider} />

          <View style={styles.reviewInfo}>
            <Ionicons name="flash" size={20} color="#2196F3" />
            <Text style={styles.reviewText}>
              {SRS_STAGE_MESSAGES[stage]}
            </Text>
          </View>
          <View style={styles.reviewDateRow}>
            <Ionicons name="calendar-outline" size={16} color="#888888" />
            <Text style={styles.reviewHint}>
              {formattedReviewDate}에 알림을 드릴게요
            </Text>
          </View>
          <Text style={styles.reviewBenefit}>
            그때 복습하면 기억이 4배 강화!
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
  srsContainer: {
    alignItems: 'center',
    gap: 12,
  },
  srsTitle: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  reviewHint: {
    fontSize: 13,
    color: '#888888',
  },
  reviewBenefit: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
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

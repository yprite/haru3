import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore, useSessionStore } from '../../src/stores';
import { Card, Button, ForgettingCurveCard } from '../../src/components';
import { getStageLabel, getStageColor, getDaysUntilReview } from '../../src/utils/srs';
import { formatDate } from '../../src/utils/date';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { sentences, loadContent } = useContentStore();
  const { reviewQueue, progressMap, loadProgress, loadReviewQueue, getNextReviewDate } = useProgressStore();
  const { startSession } = useSessionStore();

  useEffect(() => {
    loadContent();
    loadProgress();
    loadReviewQueue();
  }, [loadContent, loadProgress, loadReviewQueue]);

  const reviewSentences = sentences.filter((s) => reviewQueue.includes(s.id));

  const handleStartReview = () => {
    if (reviewSentences.length > 0) {
      startSession(reviewSentences);
      router.push(`/lesson/${reviewSentences[0].id}`);
    }
  };

  const handleSentencePress = (sentenceId: string) => {
    startSession(reviewSentences.filter((s) => s.id === sentenceId));
    router.push(`/lesson/${sentenceId}`);
  };

  if (reviewSentences.length === 0) {
    const nextReviewDate = getNextReviewDate();
    const hasLearnedSentences = progressMap.size > 0;
    const daysUntil = nextReviewDate ? getDaysUntilReview(nextReviewDate) : null;

    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.emptyIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.emptyTitle}>복습 완료!</Text>
        <Text style={styles.emptySubtitle}>
          오늘 복습할 문장이 없어요.{'\n'}
          {hasLearnedSentences && nextReviewDate ? (
            <>
              다음 복습: {formatDate(nextReviewDate)}
              {daysUntil !== null && daysUntil > 0 && ` (${daysUntil}일 후)`}
            </>
          ) : (
            '새로운 문장을 학습해 보세요.'
          )}
        </Text>
        {hasLearnedSentences && nextReviewDate && (
          <Text style={styles.srsExplanation}>
            최적의 타이밍에 복습해야 기억이 오래 남아요!
          </Text>
        )}
        <Button
          title="학습하러 가기"
          onPress={() => router.push('/')}
          style={styles.goButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>복습 대기</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{reviewSentences.length}개</Text>
        </View>
      </View>
      <Text style={styles.pageSubtitle}>
        에빙하우스 망각곡선에 따르면, 지금이 복습 골든타임!
      </Text>

      <ForgettingCurveCard
        reviewCount={reviewSentences.length}
        retentionPercent={70}
      />

      <Button
        title="지금 복습하기 (기억 4배 강화)"
        onPress={handleStartReview}
        size="large"
        style={styles.startButton}
        icon={<Ionicons name="flash" size={20} color="#ffffff" />}
      />

      <View style={styles.sentencesList}>
        {reviewSentences.map((sentence) => {
          const progress = progressMap.get(sentence.id);
          const stage = progress?.srsStage ?? 0;

          return (
            <Card
              key={sentence.id}
              style={styles.sentenceCard}
              onPress={() => handleSentencePress(sentence.id)}
            >
              <View style={styles.sentenceContent}>
                <View style={styles.sentenceTexts}>
                  <Text style={styles.japanese}>{sentence.jp}</Text>
                  <Text style={styles.korean}>{sentence.kr}</Text>
                </View>
                <View
                  style={[
                    styles.stageBadge,
                    { backgroundColor: getStageColor(stage) },
                  ]}
                >
                  <Text style={styles.stageText}>{getStageLabel(stage)}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  goButton: {
    paddingHorizontal: 32,
  },
  srsExplanation: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  countBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
  },
  startButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  sentencesList: {
    gap: 12,
  },
  sentenceCard: {
    padding: 16,
  },
  sentenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sentenceTexts: {
    flex: 1,
  },
  japanese: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  korean: {
    fontSize: 14,
    color: '#666666',
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stageText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});

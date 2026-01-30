import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore, useSessionStore } from '../../src/stores';
import { Card, Button } from '../../src/components';
import { getStageLabel, getStageColor } from '../../src/utils/srs';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { sentences, loadContent } = useContentStore();
  const { reviewQueue, progressMap, loadProgress, loadReviewQueue } = useProgressStore();
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
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.emptyIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.emptyTitle}>복습 완료!</Text>
        <Text style={styles.emptySubtitle}>
          오늘 복습할 문장이 없어요.{'\n'}
          새로운 문장을 학습해 보세요.
        </Text>
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
        잊기 전에 복습하면 기억이 더 오래 남아요
      </Text>

      <View style={styles.retentionInfo}>
        <Ionicons name="trending-up" size={18} color="#1976D2" />
        <Text style={styles.retentionText}>
          오늘 복습하면 기억 유지율 90% · 미루면 점점 잊혀져요
        </Text>
      </View>

      <Button
        title="전체 복습 시작"
        onPress={handleStartReview}
        size="large"
        style={styles.startButton}
        icon={<Ionicons name="play" size={20} color="#ffffff" />}
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
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  retentionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  retentionText: {
    fontSize: 13,
    color: '#1565C0',
    flex: 1,
  },
  startButton: {
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

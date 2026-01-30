import { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card, Button } from '../../src/components';

export default function HomeScreen() {
  const { sentences, categories, loadContent, isLoading, getCategoryById } = useContentStore();
  const { stats, reviewQueue, progressMap, loadProgress, loadReviewQueue } = useProgressStore();

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
      loadReviewQueue();
    }, [loadProgress, loadReviewQueue])
  );

  // 현재 진행 중인 카테고리 찾기
  const getCurrentCategory = () => {
    for (const category of categories) {
      const categorySentences = sentences.filter((s) => s.categoryId === category.id);
      const learnedCount = categorySentences.filter((s) => progressMap.has(s.id)).length;
      if (learnedCount < categorySentences.length) {
        return {
          category,
          learned: learnedCount,
          total: categorySentences.length,
          nextSentence: categorySentences.find((s) => !progressMap.has(s.id)),
        };
      }
    }
    // 모든 카테고리 완료 시 첫 번째 카테고리 반환
    const firstCategory = categories[0];
    if (!firstCategory) return null;
    const categorySentences = sentences.filter((s) => s.categoryId === firstCategory.id);
    return {
      category: firstCategory,
      learned: categorySentences.length,
      total: categorySentences.length,
      nextSentence: categorySentences[0],
    };
  };

  const currentProgress = getCurrentCategory();
  const reviewCount = reviewQueue.length;
  const totalLearned = stats?.totalSentencesStudied ?? 0;

  const handleStartLearning = () => {
    if (currentProgress?.nextSentence) {
      router.push(`/lesson/${currentProgress.nextSentence.id}`);
    } else if (sentences.length > 0) {
      router.push(`/lesson/${sentences[0].id}`);
    }
  };

  const handleGoToReview = () => {
    router.push('/(tabs)/review');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  const progressPercent = currentProgress
    ? (currentProgress.learned / currentProgress.total) * 100
    : 0;
  const isNewLearning = currentProgress?.learned === 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 헤더: 인사 + 통계 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>오늘도 일본어!</Text>
          <Text style={styles.statsBadge}>{totalLearned}문장 학습완료</Text>
        </View>

        {/* 메인 학습 카드 */}
        {currentProgress && (
          <Card style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.categoryIcon}>{currentProgress.category.icon}</Text>
              <Text style={styles.categoryName}>{currentProgress.category.name}</Text>
              <Text style={styles.progressText}>
                {currentProgress.learned}/{currentProgress.total}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Button
              title={isNewLearning ? '학습 시작' : '학습 계속하기'}
              onPress={handleStartLearning}
              size="large"
              icon={<Ionicons name="play" size={20} color="#ffffff" />}
            />
          </Card>
        )}

        {/* 복습 알림 */}
        {reviewCount > 0 && (
          <TouchableOpacity style={styles.reviewBanner} onPress={handleGoToReview}>
            <Ionicons name="refresh-circle" size={22} color="#FF9800" />
            <Text style={styles.reviewText}>복습 대기 {reviewCount}개</Text>
            <Ionicons name="chevron-forward" size={18} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statsBadge: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mainCard: {
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  reviewText: {
    flex: 1,
    fontSize: 15,
    color: '#F57C00',
    fontWeight: '600',
  },
});

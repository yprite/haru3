import { useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card, Button } from '../../src/components';

const DAILY_GOAL = 5; // 일일 목표 문장 수

export default function HomeScreen() {
  const { sentences, categories, loadContent, isLoading } = useContentStore();
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

  // 오늘 학습한 문장 수 계산 (간단히 progressMap 기반)
  const todayLearned = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let count = 0;
    progressMap.forEach((progress) => {
      if (progress.lastStudiedAt?.startsWith(today)) {
        count++;
      }
    });
    return count;
  }, [progressMap]);

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
  const masteredCount = stats?.masteredSentences ?? 0;

  // 오늘의 목표 달성률
  const dailyGoalPercent = Math.min((todayLearned / DAILY_GOAL) * 100, 100);
  const isDailyGoalComplete = todayLearned >= DAILY_GOAL;

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
        {/* 헤더 */}
        <Text style={styles.greeting}>오늘도 일본어!</Text>

        {/* 오늘의 목표 */}
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleRow}>
              <Ionicons
                name={isDailyGoalComplete ? 'checkmark-circle' : 'flag'}
                size={20}
                color={isDailyGoalComplete ? '#4CAF50' : '#FF9800'}
              />
              <Text style={styles.goalTitle}>오늘의 목표</Text>
            </View>
            <Text style={[styles.goalCount, isDailyGoalComplete && styles.goalComplete]}>
              {todayLearned}/{DAILY_GOAL}
            </Text>
          </View>
          <View style={styles.goalBarContainer}>
            <View
              style={[
                styles.goalBar,
                { width: `${dailyGoalPercent}%` },
                isDailyGoalComplete && styles.goalBarComplete,
              ]}
            />
          </View>
          {isDailyGoalComplete && (
            <Text style={styles.goalCompleteText}>목표 달성!</Text>
          )}
        </Card>

        {/* 통계 그리드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalLearned}</Text>
            <Text style={styles.statLabel}>학습 문장</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{masteredCount}</Text>
            <Text style={styles.statLabel}>마스터</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>복습 대기</Text>
          </View>
        </View>

        {/* 메인 학습 카드 */}
        {currentProgress && (
          <Card style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.categoryIcon}>{currentProgress.category.icon}</Text>
              <View style={styles.cardTitleArea}>
                <Text style={styles.cardLabel}>현재 학습 중</Text>
                <Text style={styles.categoryName}>{currentProgress.category.name}</Text>
              </View>
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
            <Text style={styles.reviewText}>복습하러 가기</Text>
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
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  // 오늘의 목표
  goalCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  goalCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
  },
  goalComplete: {
    color: '#4CAF50',
  },
  goalBarContainer: {
    height: 8,
    backgroundColor: '#FFE0B2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBar: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  goalBarComplete: {
    backgroundColor: '#4CAF50',
  },
  goalCompleteText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  // 통계 그리드
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  // 메인 카드
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
    fontSize: 32,
  },
  cardTitleArea: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  categoryName: {
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
  // 복습 배너
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

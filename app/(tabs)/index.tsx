import { useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card, Button } from '../../src/components';

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

  // 현재 진행 중인 카테고리 찾기
  const currentCategory = useMemo(() => {
    for (const category of categories) {
      const categorySentences = sentences
        .filter((s) => s.categoryId === category.id)
        .sort((a, b) => a.order - b.order);
      const learnedCount = categorySentences.filter((s) => progressMap.has(s.id)).length;
      if (learnedCount < categorySentences.length) {
        const nextSentence = categorySentences.find((s) => !progressMap.has(s.id));
        return {
          category,
          learned: learnedCount,
          total: categorySentences.length,
          nextSentence,
        };
      }
    }
    // 모든 카테고리 완료 시 첫 번째 카테고리
    const firstCategory = categories[0];
    if (!firstCategory) return null;
    const categorySentences = sentences.filter((s) => s.categoryId === firstCategory.id);
    return {
      category: firstCategory,
      learned: categorySentences.length,
      total: categorySentences.length,
      nextSentence: categorySentences[0],
    };
  }, [categories, sentences, progressMap]);

  const handleStartLearning = () => {
    if (currentCategory?.nextSentence) {
      router.push(`/lesson/${currentCategory.nextSentence.id}`);
    } else if (sentences.length > 0) {
      router.push(`/lesson/${sentences[0].id}`);
    }
  };

  const handleGoToReview = () => {
    router.push('/(tabs)/review');
  };

  const handleGoToCategories = () => {
    router.push('/categories');
  };

  const handleCategoryPress = (categoryId: string) => {
    const categorySentences = sentences
      .filter((s) => s.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
    if (categorySentences.length > 0) {
      router.push(`/lesson/${categorySentences[0].id}`);
    }
  };

  const reviewCount = reviewQueue.length;

  const lastStudiedSentence = useMemo(() => {
    const progressList = Array.from(progressMap.values());
    if (progressList.length === 0) return null;

    const sorted = progressList
      .filter((p) => p.lastStudiedAt)
      .sort((a, b) => {
        const dateA = new Date(a.lastStudiedAt ?? 0).getTime();
        const dateB = new Date(b.lastStudiedAt ?? 0).getTime();
        return dateB - dateA;
      });

    if (sorted.length === 0) return null;
    const lastProgress = sorted[0];
    return sentences.find((s) => s.id === lastProgress.sentenceId) ?? null;
  }, [progressMap, sentences]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>오늘도 일본어 학습!</Text>
        <Text style={styles.subGreeting}>
          매일 3문장씩, 자연스럽게 익혀요
        </Text>
      </View>

      {lastStudiedSentence && (
        <View style={styles.lastStudied}>
          <Text style={styles.lastStudiedLabel}>최근 학습한 표현</Text>
          <Text style={styles.lastStudiedText}>
            「{lastStudiedSentence.chunks[0]?.jp}」 {lastStudiedSentence.chunks[0]?.kr}
          </Text>
        </View>
      )}

      {currentCategory && (
        <Card style={styles.missionCard} onPress={handleStartLearning}>
          <View style={styles.missionHeader}>
            <View style={styles.missionIcon}>
              <Text style={styles.missionEmoji}>{currentCategory.category.icon}</Text>
            </View>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>오늘의 학습</Text>
              <Text style={styles.missionSubtitle}>
                {currentCategory.category.name} ({currentCategory.learned}/{currentCategory.total}문장)
              </Text>
            </View>
          </View>
          <Button
            title={currentCategory.learned === 0 ? '학습 시작' : '학습 계속하기'}
            onPress={handleStartLearning}
            size="large"
            icon={<Ionicons name="play" size={20} color="#ffffff" />}
          />
        </Card>
      )}

      {reviewCount > 0 && (
        <Card style={styles.reviewCard} onPress={handleGoToReview}>
          <View style={styles.reviewHeader}>
            <Ionicons name="refresh-circle" size={24} color="#FF9800" />
            <Text style={styles.reviewTitle}>복습 대기</Text>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>{reviewCount}</Text>
            </View>
          </View>
          <Text style={styles.reviewDescription}>
            복습이 필요한 문장이 있어요
          </Text>
        </Card>
      )}

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>학습 현황</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalSentencesStudied ?? 0}</Text>
            <Text style={styles.statLabel}>학습한 문장</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.masteredSentences ?? 0}</Text>
            <Text style={styles.statLabel}>마스터</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.min(stats?.currentStreak ?? 0, 7)}일</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesPreview}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <TouchableOpacity onPress={handleGoToCategories} style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
            <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        {categories.slice(0, 3).map((category) => (
          <Card
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </Card>
        ))}
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
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666666',
  },
  lastStudied: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  lastStudiedLabel: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 4,
  },
  lastStudiedText: {
    fontSize: 15,
    color: '#333333',
  },
  missionCard: {
    marginBottom: 16,
    gap: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionEmoji: {
    fontSize: 28,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  missionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  reviewCard: {
    marginBottom: 24,
    backgroundColor: '#FFF8E1',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    flex: 1,
  },
  reviewBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDescription: {
    fontSize: 14,
    color: '#5D4037',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  categoriesPreview: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666666',
  },
});

import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card, Button, DailyGoalTracker, BrainScienceBanner } from '../../src/components';

const MOTIVATIONAL_MESSAGES = [
  '오늘 3문장, 90일 후엔 270문장이 장기기억에',
  '뇌과학이 증명한 학습법: 조금씩, 자주, 꾸준히',
  '복습 알림? 뇌가 기억하기 딱 좋은 타이밍이에요',
  '3문장이면 충분해요. 나머지는 뇌가 연결해요',
  '잊기 직전 복습 = 기억 4배 강화',
  '매일 5분, 1년이면 1,000문장 마스터',
  '청킹 학습: 덩어리로 외우면 2배 쉬워요',
  '테스트 효과: 떠올리는 게 진짜 공부예요',
  '작은 습관이 큰 변화를 만들어요',
  '당신의 뇌는 이미 준비되어 있어요',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { sentences, categories, loadContent, isLoading } = useContentStore();
  const { stats, settings, reviewQueue, progressMap, loadProgress, loadReviewQueue } = useProgressStore();
  const [motivationalMessage, setMotivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMotivationalMessage(
          MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
        );
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

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

  // 오늘 학습한 문장 수 계산
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
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>하루 {settings?.dailySentenceCount ?? 3}문장</Text>
          <Text style={styles.tagline}>뇌가 기억하는 방식으로</Text>
          <Animated.Text style={[styles.subGreeting, { opacity: fadeAnim }]}>
            {motivationalMessage}
          </Animated.Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <DailyGoalTracker todayLearned={todayLearned} dailyGoal={settings?.dailySentenceCount ?? 3} />

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
            뇌가 잊기 직전이에요. 지금 복습하면 4배 강화!
          </Text>
        </Card>
      )}

      {reviewCount > 0 && (
        <BrainScienceBanner type="spacing" collapsed={true} />
      )}

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>학습 현황</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalSentencesStudied ?? 0}</Text>
            <Text style={styles.statLabel}>단기기억</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.masteredSentences ?? 0}</Text>
            <Text style={styles.statLabel}>장기기억</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.min(stats?.currentStreak ?? 0, 7)}일</Text>
            <Text style={styles.statLabel}>연속 학습</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    marginTop: 4,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666666',
  },
  lastStudied: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
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
    marginTop: 8,
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

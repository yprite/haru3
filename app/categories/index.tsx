import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card } from '../../src/components';

export default function CategoriesPage() {
  const { categories, sentences, loadContent, isLoading } = useContentStore();
  const { progressMap, loadProgress } = useProgressStore();

  useEffect(() => {
    loadContent();
    loadProgress();
  }, [loadContent, loadProgress]);

  const handleCategoryPress = (categoryId: string) => {
    const categorySentences = sentences
      .filter((s) => s.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
    if (categorySentences.length > 0) {
      router.push(`/lesson/${categorySentences[0].id}`);
    }
  };

  const getCategoryProgress = (categoryId: string) => {
    const categorySentences = sentences.filter((s) => s.categoryId === categoryId);
    const learnedCount = categorySentences.filter((s) =>
      progressMap.has(s.id)
    ).length;
    return {
      learned: learnedCount,
      total: categorySentences.length,
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '카테고리',
          headerBackTitle: '홈',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>학습 카테고리</Text>
        <Text style={styles.pageSubtitle}>
          상황별로 필요한 일본어를 배워보세요
        </Text>

        <View style={styles.categoriesList}>
          {categories.map((category) => {
            const progress = getCategoryProgress(category.id);
            const progressPercent =
              progress.total > 0
                ? Math.round((progress.learned / progress.total) * 100)
                : 0;

            return (
              <Card
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progressPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {progress.learned}/{progress.total}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
                </View>

                {category.keyPatterns && category.keyPatterns.length > 0 && (
                  <View style={styles.patternsContainer}>
                    {category.keyPatterns.map((pattern, index) => (
                      <View key={index} style={styles.patternTag}>
                        <Text style={styles.patternText}>{pattern}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  categoriesList: {
    gap: 16,
  },
  categoryCard: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#888888',
    minWidth: 36,
    textAlign: 'right',
  },
  patternsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  patternTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  patternText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

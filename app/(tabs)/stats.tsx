import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card } from '../../src/components';

export default function StatsScreen() {
  const { sentences, categories, levels, loadContent } = useContentStore();
  const { stats, progressMap, loadProgress, clearAllData } = useProgressStore();

  useFocusEffect(
    useCallback(() => {
      loadContent();
      loadProgress();
    }, [loadContent, loadProgress])
  );

  // 레벨별 진행률 계산
  const levelProgress = useMemo(() => {
    return levels.map((level) => {
      const levelSentences = sentences.filter((s) => s.level === level.number);
      const learnedCount = levelSentences.filter((s) => progressMap.has(s.id)).length;
      return {
        level,
        learned: learnedCount,
        total: levelSentences.length,
        percent: levelSentences.length > 0 ? (learnedCount / levelSentences.length) * 100 : 0,
      };
    });
  }, [levels, sentences, progressMap]);

  // 카테고리별 진행률 계산
  const categoryProgress = useMemo(() => {
    return categories.map((category) => {
      const categorySentences = sentences.filter((s) => s.categoryId === category.id);
      const learnedCount = categorySentences.filter((s) => progressMap.has(s.id)).length;
      return {
        category,
        learned: learnedCount,
        total: categorySentences.length,
        percent: categorySentences.length > 0 ? (learnedCount / categorySentences.length) * 100 : 0,
      };
    });
  }, [categories, sentences, progressMap]);

  // 전체 진행률
  const totalProgress = useMemo(() => {
    const learned = progressMap.size;
    const total = sentences.length;
    return {
      learned,
      total,
      percent: total > 0 ? (learned / total) * 100 : 0,
    };
  }, [progressMap, sentences]);

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 학습 기록이 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
          },
        },
      ]
    );
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 전체 통계 */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>학습 통계</Text>
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
            <Text style={styles.statValue}>{stats?.totalSessions ?? 0}</Text>
            <Text style={styles.statLabel}>학습 세션</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatStudyTime(stats?.totalStudyMinutes ?? 0)}</Text>
            <Text style={styles.statLabel}>총 학습 시간</Text>
          </View>
        </View>
      </Card>

      {/* 전체 진행률 */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>전체 진행률</Text>
          <Text style={styles.progressPercent}>{totalProgress.percent.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${totalProgress.percent}%` }]} />
        </View>
        <Text style={styles.progressDetail}>
          {totalProgress.learned} / {totalProgress.total} 문장
        </Text>
      </Card>

      {/* 레벨별 진행률 */}
      <Card style={styles.levelCard}>
        <Text style={styles.sectionTitle}>레벨별 진행률</Text>
        {levelProgress.map((item) => (
          <View key={item.level.id} style={styles.levelItem}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelName}>{item.level.name}</Text>
              <Text style={styles.levelPercent}>
                {item.learned}/{item.total}
              </Text>
            </View>
            <View style={styles.levelBarContainer}>
              <View
                style={[
                  styles.levelBar,
                  { width: `${item.percent}%`, backgroundColor: getLevelColor(item.level.number) },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* 카테고리별 진행률 */}
      <Card style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>카테고리별 진행률</Text>
        {categoryProgress.map((item) => (
          <View key={item.category.id} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{item.category.icon}</Text>
              <Text style={styles.categoryName}>{item.category.name}</Text>
              <Text style={styles.categoryPercent}>
                {item.percent.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.categoryBarContainer}>
              <View style={[styles.categoryBar, { width: `${item.percent}%` }]} />
            </View>
          </View>
        ))}
      </Card>

      {/* 설정 */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>설정</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleResetData}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={styles.settingTextDanger}>학습 데이터 초기화</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>IamInJapan v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function getLevelColor(level: number): string {
  switch (level) {
    case 1:
      return '#4CAF50';
    case 2:
      return '#2196F3';
    case 3:
      return '#9C27B0';
    default:
      return '#4CAF50';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statsCard: {
    padding: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  statItem: {
    width: '50%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressCard: {
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressDetail: {
    fontSize: 13,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  levelCard: {
    padding: 16,
    marginBottom: 12,
  },
  levelItem: {
    marginTop: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  levelPercent: {
    fontSize: 13,
    color: '#666666',
  },
  levelBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryCard: {
    padding: 16,
    marginBottom: 12,
  },
  categoryItem: {
    marginTop: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  categoryPercent: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  categoryBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  settingsCard: {
    padding: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingTextDanger: {
    fontSize: 15,
    color: '#F44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
});

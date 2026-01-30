import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore, useProgressStore } from '../../src/stores';
import { Card } from '../../src/components';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StatsScreen() {
  const { sentences, categories, levels, loadContent } = useContentStore();
  const { stats, progressMap, loadProgress, clearAllData } = useProgressStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useFocusEffect(
    useCallback(() => {
      loadContent();
      loadProgress();
    }, [loadContent, loadProgress])
  );

  // 학습한 날짜 Set 생성
  const studiedDates = useMemo(() => {
    const dates = new Set<string>();
    progressMap.forEach((progress) => {
      if (progress.lastStudiedAt) {
        const date = progress.lastStudiedAt.split('T')[0];
        dates.add(date);
      }
    });
    return dates;
  }, [progressMap]);

  // 연간 학습 통계 계산
  const yearStats = useMemo(() => {
    const yearStart = `${selectedYear}-01-01`;
    const yearEnd = `${selectedYear}-12-31`;

    let studiedDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // 해당 연도의 모든 날짜 순회
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= endDate && d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (studiedDates.has(dateStr)) {
        studiedDays++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // 현재 연속 학습일 계산 (오늘부터 역순)
    for (let d = new Date(today); d >= startDate; d.setDate(d.getDate() - 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (studiedDates.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    const totalDays = Math.min(
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      365
    );

    return {
      studiedDays,
      totalDays,
      percent: totalDays > 0 ? Math.round((studiedDays / totalDays) * 100) : 0,
      currentStreak,
      longestStreak,
    };
  }, [studiedDates, selectedYear]);

  // 월별 날짜 그리드 생성
  const getMonthDays = (month: number) => {
    const days: { date: string; isStudied: boolean; isToday: boolean; isFuture: boolean }[] = [];
    const year = selectedYear;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();
      const isFuture = date > today;

      days.push({
        date: dateStr,
        isStudied: studiedDates.has(dateStr),
        isToday,
        isFuture,
      });
    }
    return days;
  };

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

  const currentYear = new Date().getFullYear();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 연간 학습 캘린더 */}
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <View>
            <Text style={styles.calendarTitle}>학습 기록</Text>
            <Text style={styles.calendarYear}>{selectedYear}</Text>
          </View>
          <View style={styles.calendarStats}>
            <Text style={styles.calendarStatsMain}>
              {yearStats.studiedDays} / {yearStats.totalDays}일 • {yearStats.percent}%
            </Text>
            <Text style={styles.calendarStatsSub}>
              최장 {yearStats.longestStreak}일 연속
            </Text>
          </View>
        </View>

        {/* 년도 선택 */}
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => setSelectedYear(selectedYear - 1)}
          >
            <Ionicons name="chevron-back" size={20} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <TouchableOpacity
            style={[styles.yearButton, selectedYear >= currentYear && styles.yearButtonDisabled]}
            onPress={() => selectedYear < currentYear && setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= currentYear}
          >
            <Ionicons name="chevron-forward" size={20} color={selectedYear >= currentYear ? '#CCCCCC' : '#666666'} />
          </TouchableOpacity>
        </View>

        {/* 월별 캘린더 그리드 */}
        <View style={styles.monthsGrid}>
          {MONTHS.map((monthName, monthIndex) => (
            <View key={monthName} style={styles.monthContainer}>
              <Text style={styles.monthLabel}>{monthName}</Text>
              <View style={styles.daysGrid}>
                {getMonthDays(monthIndex).map((day, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dayCell,
                      day.isStudied && styles.dayCellStudied,
                      day.isToday && styles.dayCellToday,
                      day.isFuture && styles.dayCellFuture,
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 현재 연속 학습 */}
        {yearStats.currentStreak > 0 && (
          <View style={styles.streakBanner}>
            <Ionicons name="flame" size={20} color="#FF9800" />
            <Text style={styles.streakText}>현재 {yearStats.currentStreak}일 연속 학습 중!</Text>
          </View>
        )}
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
  // 연간 캘린더
  calendarCard: {
    padding: 16,
    marginBottom: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendarYear: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 2,
  },
  calendarStats: {
    alignItems: 'flex-end',
  },
  calendarStatsMain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarStatsSub: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  yearButton: {
    padding: 8,
  },
  yearButtonDisabled: {
    opacity: 0.5,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 60,
    textAlign: 'center',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthContainer: {
    width: '32%',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  dayCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#E8F5E9',
  },
  dayCellStudied: {
    backgroundColor: '#4CAF50',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  dayCellFuture: {
    backgroundColor: '#F5F5F5',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  // 기존 스타일
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

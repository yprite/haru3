import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../../src/stores';
import { Card } from '../../src/components';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { progressMap, loadProgress } = useProgressStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
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

  const currentYear = new Date().getFullYear();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
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
    </ScrollView>
  );
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
    padding: 18,
    marginBottom: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  calendarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendarYear: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 4,
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
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 18,
  },
  yearButton: {
    padding: 9,
  },
  yearButtonDisabled: {
    opacity: 0.5,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 72,
    textAlign: 'center',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthContainer: {
    width: '32%',
    marginBottom: 18,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 7,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dayCell: {
    width: 11,
    height: 11,
    borderRadius: 3,
    backgroundColor: '#E8F5E9',
  },
  dayCellStudied: {
    backgroundColor: '#4CAF50',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  dayCellFuture: {
    backgroundColor: '#F0F0F0',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    padding: 13,
    borderRadius: 11,
    marginTop: 10,
    gap: 9,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F57C00',
  },
});

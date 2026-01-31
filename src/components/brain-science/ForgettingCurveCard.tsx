import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SRSStage } from '../../types/content';

interface ForgettingCurveCardProps {
  currentStage?: SRSStage;
  retentionPercent?: number;
  reviewCount?: number;
}

export function ForgettingCurveCard({
  currentStage = 0,
  retentionPercent = 70,
  reviewCount = 0,
}: ForgettingCurveCardProps) {
  // 망각 곡선 시각화 (5단계로 단순화)
  const curvePoints = [
    { percent: 100, label: '학습 직후' },
    { percent: 80, label: '1일' },
    { percent: 60, label: '3일' },
    { percent: 40, label: '7일' },
    { percent: 20, label: '30일' },
  ];

  // 현재 위치 계산 (복습을 안 했을 때 예상 기억률)
  const todayRetention = Math.max(20, retentionPercent);
  const afterReviewRetention = Math.min(95, retentionPercent + 25);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={22} color="#1976D2" />
        <Text style={styles.title}>망각 곡선</Text>
      </View>

      {/* 간단한 막대 그래프 형태의 망각 곡선 */}
      <View style={styles.curveContainer}>
        {curvePoints.map((point, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${point.percent}%`,
                    backgroundColor: index === 0 ? '#4CAF50' :
                      index <= 2 ? '#FF9800' : '#F44336',
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{point.label}</Text>
          </View>
        ))}
      </View>

      {/* 핵심 메시지 */}
      <View style={styles.messageContainer}>
        <View style={styles.retentionRow}>
          <View style={styles.retentionItem}>
            <Text style={styles.retentionValue}>{todayRetention}%</Text>
            <Text style={styles.retentionLabel}>현재 기억률</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#666666" />
          <View style={styles.retentionItem}>
            <Text style={[styles.retentionValue, styles.retentionGood]}>
              {afterReviewRetention}%
            </Text>
            <Text style={styles.retentionLabel}>복습 후</Text>
          </View>
        </View>

        {reviewCount > 0 && (
          <Text style={styles.hint}>
            지금 복습하면 기억이 4배 오래 남아요!
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  curveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 60,
    width: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  messageContainer: {
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 12,
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  retentionItem: {
    alignItems: 'center',
  },
  retentionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9800',
  },
  retentionGood: {
    color: '#4CAF50',
  },
  retentionLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  hint: {
    fontSize: 13,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
});

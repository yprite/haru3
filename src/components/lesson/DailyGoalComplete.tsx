/**
 * DailyGoalComplete Component
 *
 * "오늘 목표 달성!" 화면
 * 3문장 학습 완료 후 표시
 */
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../common';

interface DailyGoalCompleteProps {
  dailyGoal: number;
  completedCount: number;
  currentStreak?: number;
  onContinueLearning: () => void;
  onFinish: () => void;
}

export function DailyGoalComplete({
  dailyGoal,
  completedCount,
  currentStreak = 0,
  onContinueLearning,
  onFinish,
}: DailyGoalCompleteProps) {
  const displayCount = Math.max(completedCount, dailyGoal);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.celebration}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={80} color="#FFD700" />
          </View>
          <Text style={styles.title}>오늘 목표 달성!</Text>
          <Text style={styles.subtitle}>
            {displayCount}문장 학습 완료
          </Text>
        </View>

        <Card style={styles.brainCard}>
          <View style={styles.brainHeader}>
            <Ionicons name="bulb" size={24} color="#9C27B0" />
            <Text style={styles.brainTitle}>뇌과학 팁</Text>
          </View>
          <Text style={styles.brainText}>
            하루에 3문장씩 꾸준히 학습하면{'\n'}
            뇌가 장기기억으로 전환하기 가장 좋아요.{'\n'}
            무리하지 않아도 괜찮아요!
          </Text>
        </Card>

        {currentStreak > 0 && (
          <Card style={styles.streakCard}>
            <View style={styles.streakContent}>
              <Ionicons name="flame" size={32} color="#FF5722" />
              <View style={styles.streakText}>
                <Text style={styles.streakNumber}>{currentStreak}일 연속</Text>
                <Text style={styles.streakLabel}>학습 중!</Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.choiceCard}>
          <Text style={styles.choiceTitle}>더 배울까요?</Text>
          <Text style={styles.choiceDescription}>
            목표는 달성했지만, 더 학습할 수 있어요
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          title="더 학습하기"
          onPress={onContinueLearning}
          size="large"
          variant="secondary"
          icon={<Ionicons name="add-circle" size={20} color="#4CAF50" />}
          style={styles.continueButton}
        />
        <Button
          title="오늘은 여기까지"
          onPress={onFinish}
          size="large"
          icon={<Ionicons name="home" size={20} color="#ffffff" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    gap: 20,
  },
  celebration: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  brainCard: {
    backgroundColor: '#F3E5F5',
    padding: 20,
  },
  brainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7B1FA2',
  },
  brainText: {
    fontSize: 15,
    color: '#4A148C',
    lineHeight: 24,
  },
  streakCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  streakText: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E65100',
  },
  streakLabel: {
    fontSize: 14,
    color: '#F57C00',
  },
  choiceCard: {
    padding: 20,
    alignItems: 'center',
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  choiceDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 20,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
});

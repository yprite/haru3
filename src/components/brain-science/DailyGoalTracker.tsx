import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DailyGoalTrackerProps {
  todayLearned: number;
  dailyGoal?: number;
}

export function DailyGoalTracker({ todayLearned, dailyGoal = 3 }: DailyGoalTrackerProps) {
  const isComplete = todayLearned >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - todayLearned);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={isComplete ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={isComplete ? '#4CAF50' : '#666666'}
        />
        <Text style={styles.title}>오늘의 목표</Text>
      </View>

      <View style={styles.circles}>
        {Array.from({ length: dailyGoal }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.circle,
              index < todayLearned && styles.circleComplete,
            ]}
          >
            {index < todayLearned && (
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            )}
          </View>
        ))}
      </View>

      <Text style={[styles.message, isComplete && styles.messageComplete]}>
        {isComplete
          ? '축하해요! 오늘의 뇌 훈련 완료'
          : `오늘 목표까지 ${remaining}문장 남았어요`}
      </Text>
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
  circles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  messageComplete: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

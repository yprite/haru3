import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../src/stores';
import { Card, Button } from '../src/components';

const DAILY_GOAL_OPTIONS = [3, 5, 10] as const;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, clearAllData, updateSettings, loadProgress } = useProgressStore();

  const dailyGoal = settings?.dailySentenceCount ?? 3;
  const autoPlayAudio = settings?.autoPlayAudio ?? true;

  const handleDailyGoalChange = (value: number) => {
    updateSettings({ dailySentenceCount: value });
  };

  const handleAutoPlayChange = (value: boolean) => {
    updateSettings({ autoPlayAudio: value });
  };

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 학습 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제하기',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadProgress();
            Alert.alert('완료', '학습 데이터가 초기화되었습니다.', [
              {
                text: '확인',
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '설정',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* 학습 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학습 설정</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>일일 목표</Text>
                <Text style={styles.settingDescription}>하루에 학습할 문장 수</Text>
              </View>
              <View style={styles.goalOptions}>
                {DAILY_GOAL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.goalOption,
                      dailyGoal === option && styles.goalOptionActive,
                    ]}
                    onPress={() => handleDailyGoalChange(option)}
                  >
                    <Text
                      style={[
                        styles.goalOptionText,
                        dailyGoal === option && styles.goalOptionTextActive,
                      ]}
                    >
                      {option}문장
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>자동 음성 재생</Text>
                <Text style={styles.settingDescription}>학습 시 자동으로 음성 재생</Text>
              </View>
              <Switch
                value={autoPlayAudio}
                onValueChange={handleAutoPlayChange}
                trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                thumbColor={autoPlayAudio ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
          </Card>
        </View>

        {/* 데이터 관리 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
          <Card style={styles.dangerCard}>
            <View style={styles.dangerContent}>
              <View style={styles.dangerIcon}>
                <Ionicons name="warning" size={24} color="#F44336" />
              </View>
              <View style={styles.dangerInfo}>
                <Text style={styles.dangerLabel}>학습 데이터 초기화</Text>
                <Text style={styles.dangerDescription}>
                  모든 진도와 통계가 삭제됩니다
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.dangerButton} onPress={handleResetData}>
              <Text style={styles.dangerButtonText}>초기화</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 앱 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>버전</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/privacy')}
            >
              <Text style={styles.linkLabel}>개인정보처리방침</Text>
              <Ionicons name="chevron-forward" size={20} color="#888888" />
            </TouchableOpacity>
          </Card>
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
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888888',
  },
  goalOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  goalOptionActive: {
    backgroundColor: '#4CAF50',
  },
  goalOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  goalOptionTextActive: {
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  dangerCard: {
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerInfo: {
    flex: 1,
  },
  dangerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 13,
    color: '#E57373',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  infoValue: {
    fontSize: 16,
    color: '#888888',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkLabel: {
    fontSize: 16,
    color: '#4CAF50',
  },
});

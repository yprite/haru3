import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '개인정보처리방침',
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
        <Text style={styles.lastUpdated}>최종 업데이트: 2025년 1월 31일</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 개요</Text>
          <Text style={styles.paragraph}>
            "하루 3문장" (이하 "앱")은 사용자의 개인정보를 소중히 여기며,
            개인정보보호법 등 관련 법령을 준수합니다. 본 개인정보처리방침은
            앱이 수집하는 정보와 그 사용 방법에 대해 설명합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 수집하는 정보</Text>
          <Text style={styles.paragraph}>
            본 앱은 다음 정보를 기기 내에서만 저장하며, 외부 서버로 전송하지 않습니다:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• 학습 진도 (학습한 문장, SRS 단계)</Text>
            <Text style={styles.listItem}>• 학습 통계 (총 학습 시간, 연속 학습일)</Text>
            <Text style={styles.listItem}>• 앱 설정 (일일 목표, 음성 재생 설정)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 정보의 저장</Text>
          <Text style={styles.paragraph}>
            모든 데이터는 사용자의 기기 내부 저장소(AsyncStorage)에만
            저장됩니다. 앱 개발자는 사용자의 학습 데이터에 접근할 수 없습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 제3자 제공</Text>
          <Text style={styles.paragraph}>
            본 앱은 사용자의 개인정보를 제3자에게 제공하지 않습니다.
            앱은 외부 서버와 통신하지 않으며, 모든 기능이 오프라인으로 동작합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 음성 합성 기능</Text>
          <Text style={styles.paragraph}>
            앱은 일본어 발음 학습을 위해 기기의 내장 음성 합성(TTS) 기능을
            사용합니다. 이 과정에서 음성 데이터가 외부로 전송되지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 데이터 삭제</Text>
          <Text style={styles.paragraph}>
            사용자는 언제든지 앱 내 설정에서 "학습 데이터 초기화" 기능을 통해
            모든 저장된 데이터를 삭제할 수 있습니다. 앱을 삭제하면 모든
            데이터가 함께 삭제됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 아동 개인정보</Text>
          <Text style={styles.paragraph}>
            본 앱은 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
            모든 데이터는 기기 내에서만 처리되며, 연령과 관계없이
            개인을 식별할 수 있는 정보를 수집하지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. 방침 변경</Text>
          <Text style={styles.paragraph}>
            본 개인정보처리방침은 법령 변경이나 서비스 변경에 따라
            수정될 수 있습니다. 변경 시 앱 내 공지를 통해 안내드립니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. 문의</Text>
          <Text style={styles.paragraph}>
            개인정보 관련 문의사항이 있으시면 아래로 연락해 주세요:
          </Text>
          <Text style={styles.contact}>support@haru3.app</Text>
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
  lastUpdated: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
  },
  list: {
    marginTop: 12,
    paddingLeft: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 28,
  },
  contact: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
});

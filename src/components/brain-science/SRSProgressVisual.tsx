import { StyleSheet, View, Text } from 'react-native';
import type { SRSStage } from '../../types/content';

interface SRSProgressVisualProps {
  currentStage: SRSStage;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const STAGE_INFO: Record<SRSStage, { label: string; description: string; color: string }> = {
  0: { label: '첫 만남', description: '당일', color: '#9E9E9E' },
  1: { label: '익숙해지는 중', description: '3일 후', color: '#FF9800' },
  2: { label: '기억 강화', description: '7일 후', color: '#2196F3' },
  3: { label: '장기기억 진입', description: '14일 후', color: '#4CAF50' },
  4: { label: '완전 마스터', description: '30일 후', color: '#9C27B0' },
};

const SIZES = {
  small: { dot: 12, line: 20, font: 10 },
  medium: { dot: 16, line: 32, font: 12 },
  large: { dot: 20, line: 40, font: 14 },
};

export function SRSProgressVisual({
  currentStage,
  showLabels = true,
  size = 'medium'
}: SRSProgressVisualProps) {
  const sizeConfig = SIZES[size];
  const stages: SRSStage[] = [0, 1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {stages.map((stage, index) => {
          const isActive = stage <= currentStage;
          const isCurrent = stage === currentStage;
          const info = STAGE_INFO[stage];

          return (
            <View key={stage} style={styles.stageContainer}>
              <View style={styles.dotContainer}>
                {/* 연결선 (첫 번째 제외) */}
                {index > 0 && (
                  <View
                    style={[
                      styles.line,
                      {
                        width: sizeConfig.line,
                        backgroundColor: stage <= currentStage ? info.color : '#E0E0E0',
                      },
                    ]}
                  />
                )}
                {/* 점 */}
                <View
                  style={[
                    styles.dot,
                    {
                      width: sizeConfig.dot,
                      height: sizeConfig.dot,
                      borderRadius: sizeConfig.dot / 2,
                      backgroundColor: isActive ? info.color : '#E0E0E0',
                      borderWidth: isCurrent ? 3 : 0,
                      borderColor: isCurrent ? '#1A1A1A' : 'transparent',
                    },
                  ]}
                />
              </View>
              {showLabels && (
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: sizeConfig.font,
                      color: isActive ? '#1A1A1A' : '#9E9E9E',
                      fontWeight: isCurrent ? '700' : '400',
                    },
                  ]}
                >
                  {info.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* 현재 단계 설명 */}
      <View style={styles.currentInfo}>
        <Text style={[styles.currentLabel, { color: STAGE_INFO[currentStage].color }]}>
          {STAGE_INFO[currentStage].label}
        </Text>
        <Text style={styles.currentDescription}>
          다음 복습: {STAGE_INFO[currentStage].description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stageContainer: {
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 3,
    marginRight: -1,
  },
  dot: {
    zIndex: 1,
  },
  label: {
    marginTop: 6,
    textAlign: 'center',
    width: 50,
  },
  currentInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  currentLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  currentDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
});

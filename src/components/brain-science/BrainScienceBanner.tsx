import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type BannerType = 'spacing' | 'chunking' | 'testing' | 'forgetting';

interface BrainScienceBannerProps {
  type: BannerType;
  collapsed?: boolean;
}

const BANNER_CONTENT: Record<BannerType, {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}> = {
  spacing: {
    title: '간격 반복 학습',
    description: '뇌가 잊기 직전에 복습하면 기억이 4배 오래 남아요. 우리가 알림을 보내드릴게요!',
    icon: 'time-outline',
    color: '#1976D2',
    bgColor: '#E3F2FD',
  },
  chunking: {
    title: '청킹 학습법',
    description: '문장을 의미 단위로 나눠서 단기기억의 한계를 극복해요. 한 번에 다 외우지 않아도 돼요.',
    icon: 'grid-outline',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
  },
  testing: {
    title: '테스트 효과',
    description: '단순히 보는 것보다 떠올리는 것이 2.5배 더 효과적이에요. 그래서 조립 퀴즈가 있어요!',
    icon: 'bulb-outline',
    color: '#F57C00',
    bgColor: '#FFF3E0',
  },
  forgetting: {
    title: '망각 곡선',
    description: '에빙하우스가 발견한 기억의 비밀! 복습 타이밍이 기억력의 핵심이에요.',
    icon: 'trending-down-outline',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
  },
};

export function BrainScienceBanner({ type, collapsed = false }: BrainScienceBannerProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const content = BANNER_CONTENT[type];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setIsExpanded(!isExpanded)}
      style={[styles.container, { backgroundColor: content.bgColor }]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={content.icon} size={20} color={content.color} />
          <Text style={[styles.title, { color: content.color }]}>{content.title}</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={content.color}
        />
      </View>

      {isExpanded && (
        <Text style={styles.description}>{content.description}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginTop: 10,
  },
});

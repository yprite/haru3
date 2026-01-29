import type { SRSStage } from '../types/content';
import type { RecallRating } from '../types/user';
import { SRS_INTERVALS } from '../types/content';

export function updateSRSStage(
  currentStage: SRSStage,
  rating: RecallRating
): SRSStage {
  switch (rating) {
    case 'forgot':
      return 0;
    case 'hard':
      return Math.max(0, currentStage - 1) as SRSStage;
    case 'good':
      return Math.min(4, currentStage + 1) as SRSStage;
    case 'easy':
      return Math.min(4, currentStage + 2) as SRSStage;
  }
}

export function calculateNextReview(stage: SRSStage): string {
  const intervalDays = SRS_INTERVALS[stage];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString().split('T')[0];
}

export function isDueForReview(nextReviewDate: string | null): boolean {
  if (!nextReviewDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return nextReviewDate <= today;
}

export function getDaysUntilReview(nextReviewDate: string | null): number | null {
  if (!nextReviewDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);

  const diffTime = reviewDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStageLabel(stage: SRSStage): string {
  const labels: Record<SRSStage, string> = {
    0: '신규',
    1: '학습중',
    2: '복습중',
    3: '숙련중',
    4: '마스터',
  };
  return labels[stage];
}

export function getStageColor(stage: SRSStage): string {
  const colors: Record<SRSStage, string> = {
    0: '#9E9E9E',
    1: '#FF9800',
    2: '#2196F3',
    3: '#4CAF50',
    4: '#9C27B0',
  };
  return colors[stage];
}

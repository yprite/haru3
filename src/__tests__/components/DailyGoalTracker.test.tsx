import React from 'react';
import { render, screen } from '../test-utils';
import { DailyGoalTracker } from '../../components/brain-science/DailyGoalTracker';

describe('DailyGoalTracker', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(<DailyGoalTracker todayLearned={0} />);
      expect(screen.getByText('오늘의 목표')).toBeTruthy();
    });

    it('renders 3 circles by default', () => {
      const { getAllByTestId } = render(<DailyGoalTracker todayLearned={0} />);
      // We can't use testID here, so we check the message instead
      expect(screen.getByText(/3문장 남았어요/)).toBeTruthy();
    });
  });

  describe('progress states', () => {
    it('shows remaining count when not complete', () => {
      render(<DailyGoalTracker todayLearned={0} dailyGoal={3} />);
      expect(screen.getByText('오늘 목표까지 3문장 남았어요')).toBeTruthy();
    });

    it('shows 2 remaining when 1 completed', () => {
      render(<DailyGoalTracker todayLearned={1} dailyGoal={3} />);
      expect(screen.getByText('오늘 목표까지 2문장 남았어요')).toBeTruthy();
    });

    it('shows 1 remaining when 2 completed', () => {
      render(<DailyGoalTracker todayLearned={2} dailyGoal={3} />);
      expect(screen.getByText('오늘 목표까지 1문장 남았어요')).toBeTruthy();
    });

    it('shows completion message when goal met', () => {
      render(<DailyGoalTracker todayLearned={3} dailyGoal={3} />);
      expect(screen.getByText('축하해요! 오늘의 뇌 훈련 완료')).toBeTruthy();
    });

    it('shows completion message when goal exceeded', () => {
      render(<DailyGoalTracker todayLearned={5} dailyGoal={3} />);
      expect(screen.getByText('축하해요! 오늘의 뇌 훈련 완료')).toBeTruthy();
    });
  });

  describe('custom daily goal', () => {
    it('respects custom daily goal', () => {
      render(<DailyGoalTracker todayLearned={2} dailyGoal={5} />);
      expect(screen.getByText('오늘 목표까지 3문장 남았어요')).toBeTruthy();
    });

    it('shows completion for custom goal', () => {
      render(<DailyGoalTracker todayLearned={5} dailyGoal={5} />);
      expect(screen.getByText('축하해요! 오늘의 뇌 훈련 완료')).toBeTruthy();
    });
  });
});

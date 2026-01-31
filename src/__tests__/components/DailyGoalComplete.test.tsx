/**
 * DailyGoalComplete Component Tests
 *
 * "오늘 목표 달성!" 화면 테스트 (TDD)
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

// Component will be created after test
// import { DailyGoalComplete } from '../../components/lesson/DailyGoalComplete';

describe('DailyGoalComplete', () => {
  const defaultProps = {
    dailyGoal: 3,
    completedCount: 3,
    onContinueLearning: jest.fn(),
    onFinish: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render congratulation message', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(<DailyGoalComplete {...defaultProps} />);

    expect(screen.getByText(/오늘 목표 달성/)).toBeTruthy();
  });

  it('should display completed count', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(<DailyGoalComplete {...defaultProps} />);

    expect(screen.getByText(/3문장 학습 완료/)).toBeTruthy();
  });

  it('should show "더 학습하기" button', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(<DailyGoalComplete {...defaultProps} />);

    expect(screen.getByText(/더 학습하기/)).toBeTruthy();
  });

  it('should show "오늘은 여기까지" button', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(<DailyGoalComplete {...defaultProps} />);

    expect(screen.getByText(/오늘은 여기까지/)).toBeTruthy();
  });

  it('should call onContinueLearning when "더 학습하기" pressed', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    const mockOnContinue = jest.fn();
    render(
      <DailyGoalComplete
        {...defaultProps}
        onContinueLearning={mockOnContinue}
      />
    );

    fireEvent.press(screen.getByText(/더 학습하기/));

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('should call onFinish when "오늘은 여기까지" pressed', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    const mockOnFinish = jest.fn();
    render(
      <DailyGoalComplete
        {...defaultProps}
        onFinish={mockOnFinish}
      />
    );

    fireEvent.press(screen.getByText(/오늘은 여기까지/));

    expect(mockOnFinish).toHaveBeenCalledTimes(1);
  });

  it('should display brain science message about spaced learning', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(<DailyGoalComplete {...defaultProps} />);

    // Brain science message about optimal learning
    expect(screen.getByText(/뇌과학 팁/)).toBeTruthy();
  });

  it('should show streak encouragement when streak > 0', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(
      <DailyGoalComplete
        {...defaultProps}
        currentStreak={5}
      />
    );

    expect(screen.getByText(/연속/)).toBeTruthy();
  });
});

describe('DailyGoalComplete - Edge Cases', () => {
  it('should handle dailyGoal of 0 gracefully', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');

    // Should not throw
    expect(() => {
      render(
        <DailyGoalComplete
          dailyGoal={0}
          completedCount={0}
          onContinueLearning={jest.fn()}
          onFinish={jest.fn()}
        />
      );
    }).not.toThrow();
  });

  it('should handle completedCount greater than dailyGoal', () => {
    const { DailyGoalComplete } = require('../../components/lesson/DailyGoalComplete');
    render(
      <DailyGoalComplete
        dailyGoal={3}
        completedCount={5}
        onContinueLearning={jest.fn()}
        onFinish={jest.fn()}
      />
    );

    // Should still show congratulations
    expect(screen.getByText(/오늘 목표 달성/)).toBeTruthy();
  });
});

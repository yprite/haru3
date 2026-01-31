import React from 'react';
import { render, screen } from '../test-utils';
import { ForgettingCurveCard } from '../../components/brain-science/ForgettingCurveCard';

describe('ForgettingCurveCard', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(<ForgettingCurveCard />);
      expect(screen.getByText('망각 곡선')).toBeTruthy();
    });

    it('renders retention percentages', () => {
      render(<ForgettingCurveCard retentionPercent={70} />);
      expect(screen.getByText('70%')).toBeTruthy();
      expect(screen.getByText('95%')).toBeTruthy(); // 70 + 25 = 95
    });

    it('renders labels', () => {
      render(<ForgettingCurveCard />);
      expect(screen.getByText('현재 기억률')).toBeTruthy();
      expect(screen.getByText('복습 후')).toBeTruthy();
    });
  });

  describe('retention calculation', () => {
    it('caps after-review retention at 95%', () => {
      render(<ForgettingCurveCard retentionPercent={90} />);
      expect(screen.getByText('95%')).toBeTruthy(); // 90 + 25 would be 115, but capped at 95
    });

    it('ensures minimum current retention of 20%', () => {
      render(<ForgettingCurveCard retentionPercent={10} />);
      expect(screen.getByText('20%')).toBeTruthy(); // Min is 20
    });
  });

  describe('review hint', () => {
    it('shows hint when reviewCount > 0', () => {
      render(<ForgettingCurveCard reviewCount={3} />);
      expect(screen.getByText('지금 복습하면 기억이 4배 오래 남아요!')).toBeTruthy();
    });

    it('does not show hint when reviewCount is 0', () => {
      render(<ForgettingCurveCard reviewCount={0} />);
      expect(screen.queryByText('지금 복습하면 기억이 4배 오래 남아요!')).toBeNull();
    });
  });

  describe('bar chart labels', () => {
    it('renders time labels', () => {
      render(<ForgettingCurveCard />);
      expect(screen.getByText('학습 직후')).toBeTruthy();
      expect(screen.getByText('1일')).toBeTruthy();
      expect(screen.getByText('3일')).toBeTruthy();
      expect(screen.getByText('7일')).toBeTruthy();
      expect(screen.getByText('30일')).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, screen } from '../test-utils';
import { SRSProgressVisual } from '../../components/brain-science/SRSProgressVisual';
import type { SRSStage } from '../../types/content';

describe('SRSProgressVisual', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<SRSProgressVisual currentStage={0} />);
      // The label appears in both timeline and current info section
      expect(screen.getAllByText('첫 만남').length).toBeGreaterThan(0);
    });
  });

  describe('stage labels', () => {
    it.each<[SRSStage, string]>([
      [0, '첫 만남'],
      [1, '익숙해지는 중'],
      [2, '기억 강화'],
      [3, '장기기억 진입'],
      [4, '완전 마스터'],
    ])('shows correct label for stage %i', (stage, label) => {
      render(<SRSProgressVisual currentStage={stage} showLabels={true} />);
      // Label appears in timeline and current info section
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  describe('stage descriptions', () => {
    it.each<[SRSStage, string]>([
      [0, '당일'],
      [1, '3일 후'],
      [2, '7일 후'],
      [3, '14일 후'],
      [4, '30일 후'],
    ])('shows correct description for stage %i', (stage, description) => {
      render(<SRSProgressVisual currentStage={stage} />);
      expect(screen.getByText(`다음 복습: ${description}`)).toBeTruthy();
    });
  });

  describe('label visibility', () => {
    it('hides labels when showLabels is false', () => {
      render(<SRSProgressVisual currentStage={0} showLabels={false} />);
      // When showLabels is false, the stage labels in the timeline are hidden
      // but the current stage info at the bottom is still visible
      expect(screen.getByText('첫 만남')).toBeTruthy();
    });
  });
});

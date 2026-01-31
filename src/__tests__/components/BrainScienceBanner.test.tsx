import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, screen } from '../test-utils';
import { BrainScienceBanner } from '../../components/brain-science/BrainScienceBanner';

describe('BrainScienceBanner', () => {
  describe('spacing type', () => {
    it('renders spacing banner with correct title', () => {
      render(<BrainScienceBanner type="spacing" />);
      expect(screen.getByText('간격 반복 학습')).toBeTruthy();
    });

    it('shows description when expanded', () => {
      render(<BrainScienceBanner type="spacing" collapsed={false} />);
      expect(screen.getByText(/뇌가 잊기 직전에 복습하면/)).toBeTruthy();
    });
  });

  describe('chunking type', () => {
    it('renders chunking banner with correct title', () => {
      render(<BrainScienceBanner type="chunking" />);
      expect(screen.getByText('청킹 학습법')).toBeTruthy();
    });

    it('shows description when expanded', () => {
      render(<BrainScienceBanner type="chunking" collapsed={false} />);
      expect(screen.getByText(/문장을 의미 단위로 나눠서/)).toBeTruthy();
    });
  });

  describe('testing type', () => {
    it('renders testing banner with correct title', () => {
      render(<BrainScienceBanner type="testing" />);
      expect(screen.getByText('테스트 효과')).toBeTruthy();
    });

    it('shows description when expanded', () => {
      render(<BrainScienceBanner type="testing" collapsed={false} />);
      expect(screen.getByText(/단순히 보는 것보다 떠올리는 것이/)).toBeTruthy();
    });
  });

  describe('forgetting type', () => {
    it('renders forgetting banner with correct title', () => {
      render(<BrainScienceBanner type="forgetting" />);
      expect(screen.getByText('망각 곡선')).toBeTruthy();
    });

    it('shows description when expanded', () => {
      render(<BrainScienceBanner type="forgetting" collapsed={false} />);
      expect(screen.getByText(/에빙하우스가 발견한/)).toBeTruthy();
    });
  });

  describe('collapse/expand behavior', () => {
    it('starts collapsed when collapsed prop is true', () => {
      render(<BrainScienceBanner type="spacing" collapsed={true} />);
      expect(screen.queryByText(/뇌가 잊기 직전에 복습하면/)).toBeNull();
    });

    it('starts expanded when collapsed prop is false', () => {
      render(<BrainScienceBanner type="spacing" collapsed={false} />);
      expect(screen.getByText(/뇌가 잊기 직전에 복습하면/)).toBeTruthy();
    });

    it('toggles on press', () => {
      render(<BrainScienceBanner type="spacing" collapsed={true} />);

      // Initially collapsed - description not visible
      expect(screen.queryByText(/뇌가 잊기 직전에 복습하면/)).toBeNull();

      // Tap to expand
      fireEvent.press(screen.getByText('간격 반복 학습'));

      // Now expanded - description visible
      expect(screen.getByText(/뇌가 잊기 직전에 복습하면/)).toBeTruthy();

      // Tap to collapse
      fireEvent.press(screen.getByText('간격 반복 학습'));

      // Back to collapsed
      expect(screen.queryByText(/뇌가 잊기 직전에 복습하면/)).toBeNull();
    });
  });
});

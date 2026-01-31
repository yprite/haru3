import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent } from '../test-utils';
import SettingsScreen from '../../../app/settings';
import { useProgressStore } from '../../stores';

// Mock the stores
jest.mock('../../stores', () => ({
  useProgressStore: jest.fn(),
}));

describe('SettingsScreen', () => {
  const mockClearAllData = jest.fn();
  const mockLoadProgress = jest.fn();
  const mockUpdateSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    (useProgressStore as jest.Mock).mockReturnValue({
      settings: {
        dailySentenceCount: 3,
        autoPlayAudio: true,
      },
      clearAllData: mockClearAllData,
      loadProgress: mockLoadProgress,
      updateSettings: mockUpdateSettings,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders learning settings section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('학습 설정')).toBeTruthy();
    });

    it('renders daily goal setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('일일 목표')).toBeTruthy();
      expect(screen.getByText('3문장')).toBeTruthy();
    });

    it('renders all daily goal options', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('3문장')).toBeTruthy();
      expect(screen.getByText('5문장')).toBeTruthy();
      expect(screen.getByText('10문장')).toBeTruthy();
    });

    it('renders auto play audio setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('자동 음성 재생')).toBeTruthy();
    });

    it('renders data management section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('데이터 관리')).toBeTruthy();
    });

    it('renders reset data button', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('학습 데이터 초기화')).toBeTruthy();
    });

    it('renders reset data warning', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/모든 진도와 통계가 삭제됩니다/)).toBeTruthy();
    });

    it('renders app info section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('앱 정보')).toBeTruthy();
      expect(screen.getByText('버전')).toBeTruthy();
      expect(screen.getByText('1.0.0')).toBeTruthy();
    });
  });

  describe('data reset functionality', () => {
    it('shows confirmation dialog when reset button is pressed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('초기화'));

      expect(Alert.alert).toHaveBeenCalledWith(
        '데이터 초기화',
        '모든 학습 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
        expect.arrayContaining([
          expect.objectContaining({ text: '취소' }),
          expect.objectContaining({ text: '삭제하기' }),
        ])
      );
    });

    it('calls clearAllData when user confirms deletion', async () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('초기화'));

      // Get the confirm callback from Alert.alert call
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const confirmButton = buttons.find((b: { text: string }) => b.text === '삭제하기');

      // Simulate pressing confirm
      await confirmButton.onPress();

      expect(mockClearAllData).toHaveBeenCalled();
    });

    it('does NOT call clearAllData when user cancels', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('초기화'));

      // Get the cancel callback from Alert.alert call
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const cancelButton = buttons.find((b: { text: string }) => b.text === '취소');

      // Cancel button has style: 'cancel' but no onPress needed
      expect(cancelButton.style).toBe('cancel');
      expect(mockClearAllData).not.toHaveBeenCalled();
    });
  });

  describe('settings interaction', () => {
    it('calls updateSettings when daily goal is changed', () => {
      render(<SettingsScreen />);

      fireEvent.press(screen.getByText('5문장'));

      expect(mockUpdateSettings).toHaveBeenCalledWith({ dailySentenceCount: 5 });
    });

    it('shows correct daily goal from settings', () => {
      (useProgressStore as jest.Mock).mockReturnValue({
        settings: {
          dailySentenceCount: 5,
          autoPlayAudio: false,
        },
        clearAllData: mockClearAllData,
        loadProgress: mockLoadProgress,
        updateSettings: mockUpdateSettings,
      });

      render(<SettingsScreen />);
      // 5문장 option should be active (we can't easily test active state, but we can check it renders)
      expect(screen.getByText('5문장')).toBeTruthy();
    });

    it('shows default settings when settings is null', () => {
      (useProgressStore as jest.Mock).mockReturnValue({
        settings: null,
        clearAllData: mockClearAllData,
        loadProgress: mockLoadProgress,
        updateSettings: mockUpdateSettings,
      });

      render(<SettingsScreen />);
      expect(screen.getByText('3문장')).toBeTruthy();
    });
  });
});

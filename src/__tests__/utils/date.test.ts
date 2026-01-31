import {
  getToday,
  formatDate,
  formatDateTime,
  isToday,
  addDays,
  daysBetween,
} from '../../utils/date';

describe('Date Utility Functions', () => {
  describe('getToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-31T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns today date in YYYY-MM-DD format', () => {
      expect(getToday()).toBe('2026-01-31');
    });
  });

  describe('formatDate', () => {
    it('formats date string to Korean format', () => {
      expect(formatDate('2026-01-31')).toBe('1월 31일');
      expect(formatDate('2026-12-25')).toBe('12월 25일');
      expect(formatDate('2026-02-01')).toBe('2월 1일');
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime to Korean format', () => {
      expect(formatDateTime('2026-01-31T09:05:00.000Z')).toMatch(
        /\d+\/\d+ \d+:\d+/
      );
    });

    it('pads minutes with zero', () => {
      const result = formatDateTime('2026-01-31T10:05:00.000Z');
      expect(result).toContain(':05');
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-31T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns true for today', () => {
      expect(isToday('2026-01-31')).toBe(true);
    });

    it('returns false for other dates', () => {
      expect(isToday('2026-01-30')).toBe(false);
      expect(isToday('2026-02-01')).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
      expect(addDays('2026-01-31', 7)).toBe('2026-02-07');
      expect(addDays('2026-01-31', 30)).toBe('2026-03-02');
    });

    it('subtracts with negative days', () => {
      expect(addDays('2026-01-31', -1)).toBe('2026-01-30');
      expect(addDays('2026-01-31', -7)).toBe('2026-01-24');
    });

    it('returns same date for 0 days', () => {
      expect(addDays('2026-01-31', 0)).toBe('2026-01-31');
    });

    it('handles month boundaries', () => {
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });
  });

  describe('daysBetween', () => {
    it('returns 0 for same date', () => {
      expect(daysBetween('2026-01-31', '2026-01-31')).toBe(0);
    });

    it('returns positive days between dates', () => {
      expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
      expect(daysBetween('2026-01-31', '2026-02-07')).toBe(7);
    });

    it('returns absolute value regardless of order', () => {
      expect(daysBetween('2026-02-07', '2026-01-31')).toBe(7);
      expect(daysBetween('2026-01-31', '2026-02-07')).toBe(7);
    });
  });
});

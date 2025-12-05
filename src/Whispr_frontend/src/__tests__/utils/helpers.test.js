/**
 * Tests for utility helper functions
 * @file helpers.test.js
 */

import {
  formatDate,
  formatDateTime,
  truncateText,
  formatCurrency,
  generateId,
  validateEmail,
  debounce,
} from '../../utils/helpers';

describe('Helper Functions', () => {
  
  describe('formatDate', () => {
    it('should return "N/A" for null input', () => {
      expect(formatDate(null)).toBe('N/A');
    });

    it('should return "N/A" for undefined input', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('should return "N/A" for empty string', () => {
      expect(formatDate('')).toBe('N/A');
    });

    it('should format valid date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('N/A');
    });

    it('should format ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('N/A');
    });

    it('should return original string for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatDateTime', () => {
    it('should return "N/A" for null input', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('should return "N/A" for undefined input', () => {
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    it('should format valid datetime string', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('N/A');
    });

    it('should return original string for invalid datetime', () => {
      expect(formatDateTime('invalid')).toBe('invalid');
    });
  });

  describe('truncateText', () => {
    it('should return empty string for null input', () => {
      expect(truncateText(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(truncateText(undefined)).toBe('');
    });

    it('should return original text if shorter than maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate text longer than maxLength', () => {
      const result = truncateText('This is a very long text', 10);
      expect(result).toBe('This is a ...');
      expect(result.length).toBe(13); // 10 chars + '...'
    });

    it('should use default maxLength of 60', () => {
      const longText = 'a'.repeat(100);
      const result = truncateText(longText);
      expect(result).toBe('a'.repeat(60) + '...');
    });

    it('should handle exact length match', () => {
      const text = 'a'.repeat(60);
      expect(truncateText(text, 60)).toBe(text);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      const result = formatCurrency(1000);
      expect(result).toBe('1,000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('0');
    });

    it('should handle null as 0', () => {
      expect(formatCurrency(null)).toBe('0');
    });

    it('should handle undefined as 0', () => {
      expect(formatCurrency(undefined)).toBe('0');
    });

    it('should format large numbers', () => {
      const result = formatCurrency(1000000);
      expect(result).toBe('1,000,000');
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('should generate ID with expected length', () => {
      const id = generateId();
      expect(id.length).toBe(9);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(validateEmail('test@mail.example.com')).toBe(true);
    });

    it('should return false for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
    });

    it('should return false for email without TLD', () => {
      expect(validateEmail('test@example')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should only call function once for multiple rapid calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should use the last arguments when called multiple times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });
});

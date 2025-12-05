/**
 * Tests for constants
 * @file constants.test.js
 */

import {
  REPORT_CATEGORIES,
  REPORT_STATUS,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
  STORAGE_KEYS,
  DEFAULT_STAKE_AMOUNT,
  DEFAULT_REWARD_MULTIPLIER,
} from '../../constants';

describe('Constants', () => {
  
  describe('REPORT_CATEGORIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(REPORT_CATEGORIES)).toBe(true);
    });

    it('should have category objects with value and label', () => {
      REPORT_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('value');
        expect(category).toHaveProperty('label');
        expect(typeof category.value).toBe('string');
        expect(typeof category.label).toBe('string');
      });
    });

    it('should include expected categories', () => {
      const values = REPORT_CATEGORIES.map(c => c.value);
      expect(values).toContain('environmental');
      expect(values).toContain('fraud');
      expect(values).toContain('cybercrime');
      expect(values).toContain('corruption');
    });

    it('should have unique values', () => {
      const values = REPORT_CATEGORIES.map(c => c.value);
      const uniqueValues = [...new Set(values)];
      expect(values.length).toBe(uniqueValues.length);
    });
  });

  describe('REPORT_STATUS', () => {
    it('should have PENDING status', () => {
      expect(REPORT_STATUS.PENDING).toBe('pending');
    });

    it('should have UNDER_REVIEW status', () => {
      expect(REPORT_STATUS.UNDER_REVIEW).toBe('under_review');
    });

    it('should have VERIFIED status', () => {
      expect(REPORT_STATUS.VERIFIED).toBe('verified');
    });

    it('should have REJECTED status', () => {
      expect(REPORT_STATUS.REJECTED).toBe('rejected');
    });

    it('should have exactly 4 statuses', () => {
      expect(Object.keys(REPORT_STATUS).length).toBe(4);
    });
  });

  describe('SORT_OPTIONS', () => {
    it('should have DATE option', () => {
      expect(SORT_OPTIONS.DATE).toBe('date');
    });

    it('should have STAKE option', () => {
      expect(SORT_OPTIONS.STAKE).toBe('stake');
    });

    it('should have EVIDENCE option', () => {
      expect(SORT_OPTIONS.EVIDENCE).toBe('evidence');
    });

    it('should have TITLE option', () => {
      expect(SORT_OPTIONS.TITLE).toBe('title');
    });
  });

  describe('SORT_DIRECTIONS', () => {
    it('should have ASC direction', () => {
      expect(SORT_DIRECTIONS.ASC).toBe('asc');
    });

    it('should have DESC direction', () => {
      expect(SORT_DIRECTIONS.DESC).toBe('desc');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have REPORTS key', () => {
      expect(STORAGE_KEYS.REPORTS).toBe('whispr_reports');
    });

    it('should have REPORTS_DETAILS key', () => {
      expect(STORAGE_KEYS.REPORTS_DETAILS).toBe('whispr_reports_details');
    });

    it('should have TOKEN_BALANCE key', () => {
      expect(STORAGE_KEYS.TOKEN_BALANCE).toBe('whispr_token_balance');
    });

    it('should have unique values', () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = [...new Set(values)];
      expect(values.length).toBe(uniqueValues.length);
    });
  });

  describe('Default Values', () => {
    it('should have DEFAULT_STAKE_AMOUNT as a positive number', () => {
      expect(typeof DEFAULT_STAKE_AMOUNT).toBe('number');
      expect(DEFAULT_STAKE_AMOUNT).toBeGreaterThan(0);
    });

    it('should have DEFAULT_REWARD_MULTIPLIER as a positive number', () => {
      expect(typeof DEFAULT_REWARD_MULTIPLIER).toBe('number');
      expect(DEFAULT_REWARD_MULTIPLIER).toBeGreaterThan(0);
    });

    it('should have DEFAULT_STAKE_AMOUNT of 10', () => {
      expect(DEFAULT_STAKE_AMOUNT).toBe(10);
    });

    it('should have DEFAULT_REWARD_MULTIPLIER of 10', () => {
      expect(DEFAULT_REWARD_MULTIPLIER).toBe(10);
    });
  });
});

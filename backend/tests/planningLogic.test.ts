import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  hasOverlap,
  validateNoOverlap,
  validateTransferRule,
  calculateTotalPrice,
  validateTimeWindow
} from '../src/planningLogic.js';
import type { Activity, PlannedActivity } from '../src/types.js';

describe('Planning Logic', () => {
  describe('timeToMinutes', () => {
    it('should convert time string to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('14:45')).toBe(885);
      expect(timeToMinutes('22:00')).toBe(1320);
    });
  });

  describe('minutesToTime', () => {
    it('should convert minutes to time string', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(885)).toBe('14:45');
      expect(minutesToTime(1320)).toBe('22:00');
    });
  });

  describe('calculateEndTime', () => {
    it('should calculate end time from start time and duration', () => {
      expect(calculateEndTime('09:00', 120)).toBe('11:00');
      expect(calculateEndTime('14:30', 90)).toBe('16:00');
      expect(calculateEndTime('10:15', 45)).toBe('11:00');
    });
  });

  describe('hasOverlap', () => {
    it('should detect overlapping time ranges', () => {
      expect(hasOverlap('09:00', '11:00', '10:00', '12:00')).toBe(true);
      expect(hasOverlap('10:00', '12:00', '09:00', '11:00')).toBe(true);
      expect(hasOverlap('09:00', '12:00', '10:00', '11:00')).toBe(true);
    });

    it('should detect non-overlapping time ranges', () => {
      expect(hasOverlap('09:00', '11:00', '11:00', '13:00')).toBe(false);
      expect(hasOverlap('11:00', '13:00', '09:00', '11:00')).toBe(false);
      expect(hasOverlap('09:00', '10:00', '11:00', '12:00')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(hasOverlap('09:00', '09:30', '09:30', '10:00')).toBe(false);
      expect(hasOverlap('09:00', '10:00', '09:00', '10:00')).toBe(true);
    });
  });

  describe('validateNoOverlap', () => {
    const plannedActivities: PlannedActivity[] = [
      { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '11:00' },
      { id: 'p2', activityId: 'a2', startTime: '14:00', endTime: '16:00' }
    ];

    it('should allow non-overlapping activity', () => {
      const result = validateNoOverlap(plannedActivities, '11:00', '13:00');
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject overlapping activity', () => {
      const result = validateNoOverlap(plannedActivities, '10:00', '12:00');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('overlaps');
    });

    it('should allow activity on empty plan', () => {
      const result = validateNoOverlap([], '09:00', '11:00');
      expect(result.valid).toBe(true);
    });

    it('should detect overlap with second activity', () => {
      const result = validateNoOverlap(plannedActivities, '15:00', '17:00');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('overlaps');
    });
  });

  describe('validateTransferRule', () => {
    const activities: Activity[] = [
      { id: 'a1', cityId: 'goa', title: 'Scuba', type: 'water_sport', duration: 180, pricePerPax: 3500 },
      { id: 'a2', cityId: 'goa', title: 'Transfer', type: 'transfer', duration: 60, pricePerPax: 1500 },
      { id: 'a3', cityId: 'goa', title: 'Another Transfer', type: 'transfer', duration: 30, pricePerPax: 800 }
    ];

    it('should allow first transfer activity', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '12:00' }
      ];
      const result = validateTransferRule(activities, plannedActivities, 'a2');
      expect(result.valid).toBe(true);
    });

    it('should reject second transfer activity', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '12:00' },
        { id: 'p2', activityId: 'a2', startTime: '13:00', endTime: '14:00' }
      ];
      const result = validateTransferRule(activities, plannedActivities, 'a3');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('one transfer');
    });

    it('should allow non-transfer activities', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a2', startTime: '09:00', endTime: '10:00' }
      ];
      const result = validateTransferRule(activities, plannedActivities, 'a1');
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateTotalPrice', () => {
    const activities: Activity[] = [
      { id: 'a1', cityId: 'goa', title: 'Scuba', type: 'water_sport', duration: 180, pricePerPax: 3500 },
      { id: 'a2', cityId: 'goa', title: 'Parasailing', type: 'water_sport', duration: 20, pricePerPax: 1500 },
      { id: 'a3', cityId: 'goa', title: 'Transfer', type: 'transfer', duration: 60, pricePerPax: 1000 }
    ];

    it('should calculate total price for single activity', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '12:00' }
      ];
      expect(calculateTotalPrice(activities, plannedActivities, 1)).toBe(3500);
      expect(calculateTotalPrice(activities, plannedActivities, 2)).toBe(7000);
    });

    it('should calculate total price for multiple activities', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '12:00' },
        { id: 'p2', activityId: 'a2', startTime: '13:00', endTime: '13:20' }
      ];
      expect(calculateTotalPrice(activities, plannedActivities, 1)).toBe(5000);
      expect(calculateTotalPrice(activities, plannedActivities, 3)).toBe(15000);
    });

    it('should return 0 for empty plan', () => {
      expect(calculateTotalPrice(activities, [], 2)).toBe(0);
    });

    it('should handle missing activities gracefully', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'nonexistent', startTime: '09:00', endTime: '12:00' }
      ];
      expect(calculateTotalPrice(activities, plannedActivities, 2)).toBe(0);
    });

    it('should recalculate correctly after removal', () => {
      const plannedActivities: PlannedActivity[] = [
        { id: 'p1', activityId: 'a1', startTime: '09:00', endTime: '12:00' },
        { id: 'p2', activityId: 'a2', startTime: '13:00', endTime: '13:20' },
        { id: 'p3', activityId: 'a3', startTime: '14:00', endTime: '15:00' }
      ];
      
      // Total with all activities
      expect(calculateTotalPrice(activities, plannedActivities, 2)).toBe(12000);
      
      // Remove middle activity
      const afterRemoval = plannedActivities.filter(p => p.id !== 'p2');
      expect(calculateTotalPrice(activities, afterRemoval, 2)).toBe(9000);
    });
  });

  describe('validateTimeWindow', () => {
    it('should allow activities within window (06:00 to 22:00)', () => {
      expect(validateTimeWindow('09:00', '11:00').valid).toBe(true);
      expect(validateTimeWindow('06:00', '08:00').valid).toBe(true);
      expect(validateTimeWindow('20:00', '22:00').valid).toBe(true);
    });

    it('should reject activities starting before 06:00', () => {
      const result = validateTimeWindow('05:00', '07:00');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('06:00 and 22:00');
    });

    it('should reject activities ending after 22:00', () => {
      const result = validateTimeWindow('21:00', '23:00');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('06:00 and 22:00');
    });

    it('should handle boundary times correctly', () => {
      expect(validateTimeWindow('06:00', '22:00').valid).toBe(true);
      expect(validateTimeWindow('06:00', '06:30').valid).toBe(true);
      expect(validateTimeWindow('21:30', '22:00').valid).toBe(true);
    });
  });
});

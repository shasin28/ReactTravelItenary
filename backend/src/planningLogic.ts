import type { Activity, PlannedActivity } from './types.js';

/**
 * Converts time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${time}`);
  }
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculates end time based on start time and duration
 */
export function calculateEndTime(startTime: string, duration: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  return minutesToTime(endMinutes);
}

/**
 * Checks if two time ranges overlap
 */
export function hasOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  // Two ranges overlap if one starts before the other ends
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Validates if a new activity can be added without overlapping existing activities
 */
export function validateNoOverlap(
  plannedActivities: PlannedActivity[],
  newStartTime: string,
  newEndTime: string
): { valid: boolean; message?: string } {
  for (const planned of plannedActivities) {
    if (hasOverlap(newStartTime, newEndTime, planned.startTime, planned.endTime)) {
      return {
        valid: false,
        message: `Activity overlaps with existing activity from ${planned.startTime} to ${planned.endTime}`
      };
    }
  }
  return { valid: true };
}

/**
 * Validates the transfer rule (max one transfer per day)
 */
export function validateTransferRule(
  activities: Activity[],
  plannedActivities: PlannedActivity[],
  newActivityId: string
): { valid: boolean; message?: string } {
  const newActivity = activities.find(a => a.id === newActivityId);
  if (!newActivity || newActivity.type !== 'transfer') {
    return { valid: true };
  }

  // Check if there's already a transfer activity
  const hasTransfer = plannedActivities.some(planned => {
    const activity = activities.find(a => a.id === planned.activityId);
    return activity?.type === 'transfer';
  });

  if (hasTransfer) {
    return {
      valid: false,
      message: 'Only one transfer activity is allowed per day'
    };
  }

  return { valid: true };
}

/**
 * Calculates total price for the day plan
 */
export function calculateTotalPrice(
  activities: Activity[],
  plannedActivities: PlannedActivity[],
  pax: number
): number {
  return plannedActivities.reduce((total, planned) => {
    const activity = activities.find(a => a.id === planned.activityId);
    if (!activity) return total;
    return total + (activity.pricePerPax * pax);
  }, 0);
}

/**
 * Validates if time is within planning window (06:00 to 22:00)
 */
export function validateTimeWindow(startTime: string, endTime: string): { valid: boolean; message?: string } {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const windowStart = timeToMinutes('06:00');
  const windowEnd = timeToMinutes('22:00');

  if (startMinutes < windowStart || endMinutes > windowEnd) {
    return {
      valid: false,
      message: 'Activities must be between 06:00 and 22:00'
    };
  }

  return { valid: true };
}

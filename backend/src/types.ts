export interface City {
  id: string;
  name: string;
  country: string;
}

export type ActivityType = 
  | 'water_sport'
  | 'sightseeing'
  | 'adventure'
  | 'leisure'
  | 'wellness'
  | 'transfer';

export interface Activity {
  id: string;
  cityId: string;
  title: string;
  type: ActivityType;
  duration: number; // in minutes
  pricePerPax: number;
}

export interface PlannedActivity {
  id: string;
  activityId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format (calculated)
}

export interface DayPlan {
  cityId: string;
  pax: number;
  activities: PlannedActivity[];
  totalPrice: number;
}

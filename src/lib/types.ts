export type MomentType = 
  | 'small-win' 
  | 'big-win' 
  | 'people' 
  | 'health' 
  | 'work' 
  | 'learning' 
  | 'other';

export interface Note {
  id: string;
  weekKey: string; // Format: YYYY-WW (e.g., "2025-03")
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  title?: string;
  body: string;
  mood: 1 | 2 | 3 | 4 | 5;
  momentType: MomentType;
  tags: string[];
  isBackfill?: boolean; // True if note was added for a past week
}

export interface AppSettings {
  reminderDay: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Saturday = 6
  reminderTime: string; // Format: "HH:MM" (e.g., "18:00")
  themeMode: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  hideNotes: boolean; // Privacy mode
}

export interface WeekInfo {
  weekKey: string;
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  hasNote: boolean;
  note?: Note;
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export const MOMENT_TYPES: { value: MomentType; label: string; emoji: string }[] = [
  { value: 'small-win', label: 'Small Win', emoji: '✨' },
  { value: 'big-win', label: 'Big Win', emoji: '🏆' },
  { value: 'people', label: 'People', emoji: '💕' },
  { value: 'health', label: 'Health', emoji: '🌿' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '💫' },
];

export const MOOD_COLORS = [
  'hsl(0, 70%, 65%)',    // 1 - Rough
  'hsl(25, 70%, 60%)',   // 2 - Meh
  'hsl(45, 70%, 55%)',   // 3 - Okay
  'hsl(80, 60%, 50%)',   // 4 - Good
  'hsl(140, 55%, 45%)',  // 5 - Great
];

export const MOOD_LABELS = [
  'Rough',
  'Meh', 
  'Okay',
  'Good',
  'Great',
];

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DEFAULT_SETTINGS: AppSettings = {
  reminderDay: 0, // Sunday
  reminderTime: '18:00',
  themeMode: 'light',
  reducedMotion: false,
  hideNotes: false,
};

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
  weekNumber: number;
  year: number;
  title?: string;
  body: string;
  mood: 1 | 2 | 3 | 4 | 5;
  momentType: MomentType;
  tags: string[];
  createdAt: Date;
}

export interface WeekInfo {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  hasNote: boolean;
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

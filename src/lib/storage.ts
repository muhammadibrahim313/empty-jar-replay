import { Note, AppSettings, DEFAULT_SETTINGS } from './types';

const NOTES_STORAGE_KEY = 'empty-jar-notes';
const SETTINGS_STORAGE_KEY = 'empty-jar-settings';
const PENDING_SYNC_KEY = 'empty-jar-pending-sync';
const GUEST_SYNCED_KEY = 'empty-jar-guest-synced';

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'notes' | 'settings';
  data: any;
  timestamp: number;
}

// Get ISO week number and year
export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-${weekNum.toString().padStart(2, '0')}`;
}

export function parseWeekKey(weekKey: string): { year: number; weekNumber: number } {
  const [year, week] = weekKey.split('-').map(Number);
  return { year, weekNumber: week };
}

export function validateWeekKey(weekKey: string): boolean {
  const regex = /^\d{4}-(0[1-9]|[1-4][0-9]|5[0-3])$/;
  return regex.test(weekKey);
}

// Get start of week (Monday)
export function getWeekStart(weekNumber: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const startOfWeek = new Date(simple);
  if (dow <= 4)
    startOfWeek.setDate(simple.getDate() - simple.getDay() + 1);
  else
    startOfWeek.setDate(simple.getDate() + 8 - simple.getDay());
  return startOfWeek;
}

// Get end of week (Sunday)
export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  return end;
}

// Format date range
export function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

// Local Storage functions for guest mode
export function loadLocalNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load notes from storage:', e);
  }
  return [];
}

export function saveLocalNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to storage:', e);
  }
}

export function loadLocalSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage:', e);
  }
}

// Pending sync queue for offline support
export function loadPendingChanges(): PendingChange[] {
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load pending changes:', e);
  }
  return [];
}

export function savePendingChanges(changes: PendingChange[]): void {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(changes));
  } catch (e) {
    console.error('Failed to save pending changes:', e);
  }
}

export function addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): void {
  const changes = loadPendingChanges();
  changes.push({
    ...change,
    id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  });
  savePendingChanges(changes);
}

export function clearPendingChanges(): void {
  localStorage.removeItem(PENDING_SYNC_KEY);
}

// Guest sync tracking
export function hasGuestBeenSynced(): boolean {
  return localStorage.getItem(GUEST_SYNCED_KEY) === 'true';
}

export function markGuestAsSynced(): void {
  localStorage.setItem(GUEST_SYNCED_KEY, 'true');
}

export function clearGuestData(): void {
  localStorage.removeItem(NOTES_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  localStorage.removeItem(PENDING_SYNC_KEY);
  // Don't clear GUEST_SYNCED_KEY - we want to remember they synced
}

// Check if there are guest notes to sync
export function getGuestNotesToSync(): Note[] {
  if (hasGuestBeenSynced()) {
    return [];
  }
  return loadLocalNotes();
}

// Generate week info for a year
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

export function generateWeeksForYear(year: number, notes: Note[]): WeekInfo[] {
  const currentWeekKey = getWeekKey(new Date());
  const weeks: WeekInfo[] = [];
  
  // Get number of weeks in the year (52 or 53)
  const lastDay = new Date(year, 11, 31);
  const lastWeekKey = getWeekKey(lastDay);
  const { weekNumber: lastWeekNum } = parseWeekKey(lastWeekKey);
  const numWeeks = lastWeekNum === 1 ? 52 : Math.min(lastWeekNum, 53);
  
  for (let weekNum = 1; weekNum <= numWeeks; weekNum++) {
    const weekKey = `${year}-${weekNum.toString().padStart(2, '0')}`;
    const startDate = getWeekStart(weekNum, year);
    const endDate = getWeekEnd(startDate);
    const note = notes.find(n => n.weekKey === weekKey);
    const { year: currentYear, weekNumber: currentWeekNum } = parseWeekKey(currentWeekKey);
    
    const isCurrent = weekKey === currentWeekKey;
    const isPast = year < currentYear || (year === currentYear && weekNum < currentWeekNum);
    const isFuture = year > currentYear || (year === currentYear && weekNum > currentWeekNum);
    
    weeks.push({
      weekKey,
      weekNumber: weekNum,
      year,
      startDate,
      endDate,
      hasNote: !!note,
      note,
      isCurrent,
      isPast,
      isFuture,
    });
  }
  
  return weeks;
}

// Search and filter notes
export interface NoteFilters {
  searchQuery?: string;
  moods?: (1 | 2 | 3 | 4 | 5)[];
  momentTypes?: string[];
  tags?: string[];
}

export function filterNotes(notes: Note[], filters: NoteFilters): Note[] {
  return notes.filter(note => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = note.title?.toLowerCase().includes(query);
      const matchesBody = note.body.toLowerCase().includes(query);
      const matchesTags = note.tags.some(t => t.toLowerCase().includes(query));
      if (!matchesTitle && !matchesBody && !matchesTags) return false;
    }
    
    if (filters.moods && filters.moods.length > 0) {
      if (!filters.moods.includes(note.mood)) return false;
    }
    
    if (filters.momentTypes && filters.momentTypes.length > 0) {
      if (!filters.momentTypes.includes(note.momentType)) return false;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(t => note.tags.includes(t))) return false;
    }
    
    return true;
  });
}

export function getAllTags(notes: Note[]): string[] {
  const tagSet = new Set<string>();
  notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

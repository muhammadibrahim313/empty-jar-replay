import { useState, useCallback, useMemo, useEffect } from 'react';
import { Note, AppSettings, WeekInfo, DEFAULT_SETTINGS } from '@/lib/types';
import { 
  loadNotes, 
  saveNotes, 
  loadSettings, 
  saveSettings, 
  getWeekKey, 
  parseWeekKey,
  generateWeeksForYear,
  shouldShowReminder,
} from '@/lib/storage';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [showReminder, setShowReminder] = useState(false);

  // Persist notes to localStorage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Check reminder on mount
  useEffect(() => {
    setShowReminder(shouldShowReminder(settings));
  }, [settings]);

  const currentWeekKey = useMemo(() => getWeekKey(new Date()), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Generate weeks for current year
  const weeks: WeekInfo[] = useMemo(() => {
    return generateWeeksForYear(currentYear, notes);
  }, [notes, currentYear]);

  const currentWeek = useMemo(() => {
    return weeks.find(w => w.weekKey === currentWeekKey);
  }, [weeks, currentWeekKey]);

  // Add a new note (enforces one per week)
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    const existingNote = notes.find(n => n.weekKey === noteData.weekKey);
    if (existingNote) {
      console.warn('Note already exists for this week');
      return null;
    }

    const { weekNumber } = parseWeekKey(noteData.weekKey);
    const { weekNumber: currentWeekNum } = parseWeekKey(currentWeekKey);
    const isBackfill = noteData.weekKey < currentWeekKey;

    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBackfill,
    };

    setNotes(prev => [...prev, newNote]);
    setShowReminder(false);
    return newNote.id;
  }, [notes, currentWeekKey]);

  // Update an existing note (only current week allowed for edits)
  const updateNote = useCallback((noteId: string, updates: Partial<Omit<Note, 'id' | 'weekKey' | 'createdAt'>>) => {
    setNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      
      // Only allow editing current week's note
      if (note.weekKey !== currentWeekKey) {
        console.warn('Cannot edit notes from past weeks');
        return note;
      }

      return {
        ...note,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [currentWeekKey]);

  // Delete a note
  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  // Get note for a specific week
  const getNoteForWeek = useCallback((weekKey: string): Note | undefined => {
    return notes.find(n => n.weekKey === weekKey);
  }, [notes]);

  // Check if a week has a note
  const hasNoteForWeek = useCallback((weekKey: string): boolean => {
    return notes.some(n => n.weekKey === weekKey);
  }, [notes]);

  // Can edit note (only current week)
  const canEditNote = useCallback((weekKey: string): boolean => {
    return weekKey === currentWeekKey;
  }, [currentWeekKey]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Dismiss reminder
  const dismissReminder = useCallback(() => {
    setShowReminder(false);
  }, []);

  // Toggle privacy mode
  const togglePrivacy = useCallback(() => {
    setSettings(prev => ({ ...prev, hideNotes: !prev.hideNotes }));
  }, []);

  // Get notes sorted by week
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  }, [notes]);

  // Stats
  const notesCount = notes.length;
  const canReplay = notesCount >= 10;

  return {
    notes,
    sortedNotes,
    weeks,
    currentWeek,
    currentWeekKey,
    currentYear,
    settings,
    showReminder,
    notesCount,
    canReplay,
    addNote,
    updateNote,
    deleteNote,
    getNoteForWeek,
    hasNoteForWeek,
    canEditNote,
    updateSettings,
    dismissReminder,
    togglePrivacy,
  };
}

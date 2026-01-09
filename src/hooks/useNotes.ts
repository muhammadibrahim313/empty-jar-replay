import { useState, useCallback, useMemo, useEffect } from 'react';
import { Note, AppSettings, DEFAULT_SETTINGS } from '@/lib/types';
import { 
  loadLocalNotes, 
  saveLocalNotes, 
  loadLocalSettings, 
  saveLocalSettings, 
  getWeekKey, 
  parseWeekKey,
  generateWeeksForYear,
  loadPendingChanges,
  savePendingChanges,
  clearPendingChanges,
  getGuestNotesToSync,
  markGuestAsSynced,
  clearGuestData,
  validateWeekKey,
  PendingChange,
} from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNotes() {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [guestNotesToSync, setGuestNotesToSync] = useState<Note[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentWeekKey = useMemo(() => getWeekKey(new Date()), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data based on auth state
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadUserData();
      // Check for guest notes to sync
      const guestNotes = getGuestNotesToSync();
      if (guestNotes.length > 0) {
        setGuestNotesToSync(guestNotes);
        setShowSyncPrompt(true);
      }
    } else {
      // Guest mode - load from localStorage
      setNotes(loadLocalNotes());
      setSettings(loadLocalSettings());
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Sync pending changes when coming online
  const syncPendingChanges = async () => {
    if (!user) return;

    const pending = loadPendingChanges();
    if (pending.length === 0) return;

    for (const change of pending) {
      try {
        if (change.table === 'notes') {
          if (change.type === 'create') {
            await supabase.from('notes').insert(change.data);
          } else if (change.type === 'update') {
            await supabase.from('notes').update(change.data).eq('id', change.data.id);
          } else if (change.type === 'delete') {
            await supabase.from('notes').delete().eq('id', change.data.id);
          }
        } else if (change.table === 'settings') {
          await supabase.from('settings').upsert(change.data);
        }
      } catch (error) {
        console.error('Failed to sync pending change:', error);
      }
    }

    clearPendingChanges();
    loadUserData();
  };

  // Load user data from database
  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('week_key', { ascending: true });

      if (notesError) throw notesError;

      const mappedNotes: Note[] = (notesData || []).map(n => ({
        id: n.id,
        weekKey: n.week_key,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
        title: n.title || undefined,
        body: n.body,
        mood: n.mood as 1 | 2 | 3 | 4 | 5,
        momentType: n.moment_type as Note['momentType'],
        tags: n.tags || [],
        isBackfill: n.is_backfilled || false,
      }));

      setNotes(mappedNotes);

      // Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings({
          reminderDay: settingsData.reminder_day as AppSettings['reminderDay'],
          reminderTime: settingsData.reminder_time,
          themeMode: settingsData.theme_mode as AppSettings['themeMode'],
          reducedMotion: settingsData.reduced_motion,
          hideNotes: settingsData.hide_notes,
          emailRemindersEnabled: settingsData.email_reminders_enabled ?? true,
          emailReminderDay: (settingsData.email_reminder_day as AppSettings['emailReminderDay']) ?? 'Sunday',
          emailReminderTime: settingsData.email_reminder_time ?? '19:00',
          timezone: settingsData.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'America/New_York',
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load your notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync guest notes to account
  const syncGuestNotes = async () => {
    if (!user || guestNotesToSync.length === 0) return;

    try {
      const notesToInsert = guestNotesToSync.map(note => ({
        user_id: user.id,
        week_key: note.weekKey,
        title: note.title,
        body: note.body,
        mood: note.mood,
        tags: note.tags,
        moment_type: note.momentType,
        is_backfilled: note.isBackfill || false,
      }));

      const { error } = await supabase.from('notes').insert(notesToInsert);

      if (error) {
        if (error.code === '23505') {
          toast.info('Some notes already exist - skipping duplicates');
        } else {
          throw error;
        }
      }

      markGuestAsSynced();
      clearGuestData();
      setShowSyncPrompt(false);
      setGuestNotesToSync([]);
      loadUserData();
      toast.success(`Synced ${guestNotesToSync.length} notes to your account!`);
    } catch (error) {
      console.error('Failed to sync guest notes:', error);
      toast.error('Failed to sync guest notes');
    }
  };

  const dismissSyncPrompt = () => {
    markGuestAsSynced();
    setShowSyncPrompt(false);
    setGuestNotesToSync([]);
  };

  // Add a new note
  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    // Validate week_key
    if (!validateWeekKey(noteData.weekKey)) {
      toast.error('Invalid week format');
      return null;
    }

    // Check for existing note
    const existingNote = notes.find(n => n.weekKey === noteData.weekKey);
    if (existingNote) {
      toast.error('You already have a note for this week');
      return null;
    }

    const isBackfill = noteData.weekKey < currentWeekKey;
    const now = new Date().toISOString();

    if (user) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            week_key: noteData.weekKey,
            title: noteData.title,
            body: noteData.body,
            mood: noteData.mood,
            tags: noteData.tags,
            moment_type: noteData.momentType,
            is_backfilled: isBackfill,
          })
          .select()
          .single();

        if (error) throw error;

        const newNote: Note = {
          id: data.id,
          weekKey: data.week_key,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          title: data.title || undefined,
          body: data.body,
          mood: data.mood as Note['mood'],
          momentType: data.moment_type as Note['momentType'],
          tags: data.tags || [],
          isBackfill: data.is_backfilled,
        };

        setNotes(prev => [...prev, newNote]);
        toast.success('Note saved!');
        return newNote.id;
      } catch (error: any) {
        console.error('Failed to add note:', error);
        
        // Offline - queue for later
        if (!isOnline) {
          const offlineNote: Note = {
            ...noteData,
            id: `offline-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            isBackfill,
          };
          setNotes(prev => [...prev, offlineNote]);
          savePendingChanges([...loadPendingChanges(), {
            id: offlineNote.id,
            type: 'create',
            table: 'notes',
            data: {
              user_id: user.id,
              week_key: noteData.weekKey,
              title: noteData.title,
              body: noteData.body,
              mood: noteData.mood,
              tags: noteData.tags,
              moment_type: noteData.momentType,
              is_backfilled: isBackfill,
            },
            timestamp: Date.now(),
          }]);
          toast.info('Saved offline - will sync when online');
          return offlineNote.id;
        }

        toast.error('Failed to save note');
        return null;
      }
    } else {
      // Guest mode
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        isBackfill,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveLocalNotes(updatedNotes);
      toast.success('Note saved locally');
      return newNote.id;
    }
  }, [notes, currentWeekKey, user, isOnline]);

  // Update an existing note
  const updateNote = useCallback(async (noteId: string, updates: Partial<Omit<Note, 'id' | 'weekKey' | 'createdAt'>>) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Only allow editing current week's note
    if (note.weekKey !== currentWeekKey) {
      toast.error('Cannot edit notes from past weeks');
      return;
    }

    if (user) {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            title: updates.title,
            body: updates.body,
            mood: updates.mood,
            tags: updates.tags,
            moment_type: updates.momentType,
          })
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        ));
        toast.success('Note updated!');
      } catch (error) {
        console.error('Failed to update note:', error);
        toast.error('Failed to update note');
      }
    } else {
      // Guest mode
      const updatedNotes = notes.map(n => 
        n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      setNotes(updatedNotes);
      saveLocalNotes(updatedNotes);
      toast.success('Note updated locally');
    }
  }, [notes, currentWeekKey, user]);

  // Delete a note
  const deleteNote = useCallback(async (noteId: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotes(prev => prev.filter(n => n.id !== noteId));
        toast.success('Note deleted');
      } catch (error) {
        console.error('Failed to delete note:', error);
        toast.error('Failed to delete note');
      }
    } else {
      // Guest mode
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      saveLocalNotes(updatedNotes);
    }
  }, [notes, user]);

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
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (user) {
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({
            user_id: user.id,
            reminder_day: newSettings.reminderDay,
            reminder_time: newSettings.reminderTime,
            theme_mode: newSettings.themeMode,
            reduced_motion: newSettings.reducedMotion,
            hide_notes: newSettings.hideNotes,
            email_reminders_enabled: newSettings.emailRemindersEnabled,
            email_reminder_day: newSettings.emailReminderDay,
            email_reminder_time: newSettings.emailReminderTime,
            timezone: newSettings.timezone,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    } else {
      saveLocalSettings(newSettings);
    }
  }, [settings, user]);

  // Toggle privacy mode
  const togglePrivacy = useCallback(() => {
    updateSettings({ hideNotes: !settings.hideNotes });
  }, [settings.hideNotes, updateSettings]);

  // Generate weeks for selected year
  const weeks = useMemo(() => {
    return generateWeeksForYear(selectedYear, notes);
  }, [notes, selectedYear]);

  const currentWeek = useMemo(() => {
    return weeks.find(w => w.weekKey === currentWeekKey);
  }, [weeks, currentWeekKey]);

  // Get notes sorted by week
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => a.weekKey.localeCompare(b.weekKey));
  }, [notes]);

  // Get notes for selected year (for replay)
  const notesForSelectedYear = useMemo(() => {
    return sortedNotes.filter(n => n.weekKey.startsWith(`${selectedYear}-`));
  }, [sortedNotes, selectedYear]);

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set(notes.map(n => parseInt(n.weekKey.split('-')[0])));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [notes, currentYear]);

  // Check if should show reminder
  const showReminder = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentDay === settings.reminderDay && currentTime >= settings.reminderTime) {
      return !hasNoteForWeek(currentWeekKey);
    }
    return false;
  }, [settings.reminderDay, settings.reminderTime, currentWeekKey, hasNoteForWeek]);

  const dismissReminder = useCallback(() => {
    // Just hide it for this session - no persistent state needed
  }, []);

  // Stats
  const notesCount = notes.length;
  const canReplay = notesForSelectedYear.length >= 10;

  return {
    notes,
    sortedNotes,
    notesForSelectedYear,
    weeks,
    currentWeek,
    currentWeekKey,
    currentYear,
    selectedYear,
    setSelectedYear,
    availableYears,
    settings,
    showReminder,
    notesCount,
    canReplay,
    isLoading: isLoading || authLoading,
    isOnline,
    isGuest,
    showSyncPrompt,
    guestNotesToSync,
    addNote,
    updateNote,
    deleteNote,
    getNoteForWeek,
    hasNoteForWeek,
    canEditNote,
    updateSettings,
    dismissReminder,
    togglePrivacy,
    syncGuestNotes,
    dismissSyncPrompt,
  };
}

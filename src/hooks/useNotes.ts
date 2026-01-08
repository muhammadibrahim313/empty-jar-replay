import { useState, useCallback, useMemo } from 'react';
import { Note, WeekInfo } from '@/lib/types';

// Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Get start of week (Monday)
function getWeekStart(weekNumber: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const startOfWeek = simple;
  if (dow <= 4)
    startOfWeek.setDate(simple.getDate() - simple.getDay() + 1);
  else
    startOfWeek.setDate(simple.getDate() + 8 - simple.getDay());
  return startOfWeek;
}

// Get end of week (Sunday)
function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  return end;
}

// Generate sample notes for demo
function generateSampleNotes(): Note[] {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: '1',
      weekNumber: 3,
      year: currentYear,
      title: 'First snow of the year',
      body: 'Woke up to a blanket of white. Made hot chocolate and watched it fall for an hour. Simple magic.',
      mood: 5,
      momentType: 'small-win',
      tags: ['nature', 'peace'],
      createdAt: new Date(currentYear, 0, 18),
    },
    {
      id: '2', 
      weekNumber: 8,
      year: currentYear,
      title: 'Promotion came through',
      body: 'After two years of hard work, finally got the recognition. Celebrated with the team.',
      mood: 5,
      momentType: 'big-win',
      tags: ['career', 'milestone'],
      createdAt: new Date(currentYear, 1, 22),
    },
    {
      id: '3',
      weekNumber: 12,
      year: currentYear,
      body: 'Long call with Mom. She told stories about grandpa I never knew. Grateful for these conversations.',
      mood: 4,
      momentType: 'people',
      tags: ['family'],
      createdAt: new Date(currentYear, 2, 20),
    },
    {
      id: '4',
      weekNumber: 15,
      year: currentYear,
      title: 'Finished the marathon',
      body: '4 hours 23 minutes. Not my best time, but I did it. Body is sore but spirit is soaring.',
      mood: 5,
      momentType: 'health',
      tags: ['running', 'achievement'],
      createdAt: new Date(currentYear, 3, 12),
    },
    {
      id: '5',
      weekNumber: 20,
      year: currentYear,
      body: 'Figured out that tricky bug that had me stuck for days. Sometimes you just need to sleep on it.',
      mood: 4,
      momentType: 'work',
      tags: ['problem-solving'],
      createdAt: new Date(currentYear, 4, 17),
    },
  ];
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const currentWeek = useMemo(() => {
    const now = new Date();
    return getWeekNumber(now);
  }, []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const weeks: WeekInfo[] = useMemo(() => {
    return Array.from({ length: 52 }, (_, i) => {
      const weekNum = i + 1;
      const startDate = getWeekStart(weekNum, currentYear);
      const endDate = getWeekEnd(startDate);
      return {
        weekNumber: weekNum,
        year: currentYear,
        startDate,
        endDate,
        hasNote: notes.some(n => n.weekNumber === weekNum && n.year === currentYear),
      };
    });
  }, [notes, currentYear]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
    if (isFirstTime) setIsFirstTime(false);
  }, [isFirstTime]);

  const getNoteForWeek = useCallback((weekNumber: number, year: number): Note | undefined => {
    return notes.find(n => n.weekNumber === weekNumber && n.year === year);
  }, [notes]);

  const loadSampleNotes = useCallback(() => {
    setNotes(generateSampleNotes());
    setIsFirstTime(false);
  }, []);

  const canReplay = notes.length >= 10;
  const notesCount = notes.length;

  return {
    notes,
    weeks,
    currentWeek,
    currentYear,
    addNote,
    getNoteForWeek,
    loadSampleNotes,
    isFirstTime,
    canReplay,
    notesCount,
  };
}

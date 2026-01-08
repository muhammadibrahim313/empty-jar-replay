import { Suspense, lazy, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Eye, EyeOff, Search, X, Download, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import WeeklyPanel from '@/components/WeeklyPanel';
import Timeline from '@/components/Timeline';
import NoteComposer from '@/components/NoteComposer';
import ReminderBanner from '@/components/ReminderBanner';
import SettingsModal from '@/components/SettingsModal';
import SearchFilter from '@/components/SearchFilter';
import NoteViewer from '@/components/NoteViewer';
import { Note, WeekInfo } from '@/lib/types';
import { parseWeekKey } from '@/lib/storage';

// Lazy load the 3D scene for performance
const JarScene = lazy(() => import('@/components/jar/JarScene'));

function JarLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-caption">Loading your jar...</p>
      </div>
    </div>
  );
}

export default function AppPage() {
  const navigate = useNavigate();
  const { 
    notes, 
    weeks, 
    currentWeek,
    currentWeekKey,
    currentYear, 
    settings,
    showReminder,
    canReplay,
    notesCount,
    addNote, 
    updateNote,
    getNoteForWeek,
    canEditNote,
    updateSettings,
    dismissReminder,
    togglePrivacy,
  } = useNotes();

  const [selectedWeekKey, setSelectedWeekKey] = useState(currentWeekKey);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  const selectedWeek = useMemo(() => {
    return weeks.find(w => w.weekKey === selectedWeekKey) || currentWeek || weeks[0];
  }, [weeks, selectedWeekKey, currentWeek]);

  const noteForSelectedWeek = useMemo(() => {
    return getNoteForWeek(selectedWeekKey);
  }, [selectedWeekKey, getNoteForWeek]);

  const isFirstTime = notesCount === 0;

  const handleAddNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    const newId = addNote(noteData);
    if (newId) {
      setNewNoteId(newId);
      setTimeout(() => setNewNoteId(null), 2000);
    }
    setIsComposerOpen(false);
    setIsEditing(false);
  };

  const handleEditNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    if (noteForSelectedWeek) {
      updateNote(noteForSelectedWeek.id, {
        title: noteData.title,
        body: noteData.body,
        mood: noteData.mood,
        momentType: noteData.momentType,
        tags: noteData.tags,
      });
    }
    setIsComposerOpen(false);
    setIsEditing(false);
  };

  const handleOpenComposer = (edit: boolean = false) => {
    setIsEditing(edit);
    setIsComposerOpen(true);
  };

  const handleWeekSelect = (weekKey: string) => {
    setSelectedWeekKey(weekKey);
  };

  const handlePrevWeek = () => {
    const currentIndex = weeks.findIndex(w => w.weekKey === selectedWeekKey);
    if (currentIndex > 0) {
      setSelectedWeekKey(weeks[currentIndex - 1].weekKey);
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex(w => w.weekKey === selectedWeekKey);
    if (currentIndex < weeks.length - 1) {
      setSelectedWeekKey(weeks[currentIndex + 1].weekKey);
    }
  };

  const handleNoteClick = (note: Note) => {
    setViewingNote(note);
  };

  const handleStartReplay = () => {
    if (canReplay) {
      navigate('/replay');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reminder Banner */}
      <AnimatePresence>
        {showReminder && (
          <ReminderBanner onDismiss={dismissReminder} onAddNote={() => handleOpenComposer(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`fixed left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border ${showReminder ? 'top-14' : 'top-0'}`}>
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="btn-ghost -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display font-medium">Empty Jar</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="btn-ghost p-2"
              title="Search notes"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={togglePrivacy}
              className="btn-ghost p-2"
              title={settings.hideNotes ? 'Show notes' : 'Hide notes'}
            >
              {settings.hideNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="btn-ghost p-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <span className="text-caption ml-2">{currentYear}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`min-h-screen flex flex-col lg:flex-row ${showReminder ? 'pt-[7.5rem]' : 'pt-16'}`}>
        {/* Left: Jar Scene */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:flex-1 h-[50vh] lg:h-auto lg:min-h-[calc(100vh-4rem)] relative"
        >
          <Suspense fallback={<JarLoader />}>
            <JarScene 
              notes={notes} 
              newNoteId={newNoteId}
              onNoteClick={handleNoteClick}
              className="w-full h-full"
              size="panel"
            />
          </Suspense>

          {/* Notes count overlay */}
          <div className="absolute bottom-6 left-6 glass-panel px-4 py-2 flex items-center gap-3">
            <span className="text-sm font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
            {canReplay && (
              <button 
                onClick={handleStartReplay}
                className="btn-ghost p-1.5 text-primary"
                title="Replay your year"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Right: Weekly Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:w-[420px] xl:w-[480px] border-l border-border bg-card/50"
        >
          <div className="h-full flex flex-col p-6">
            <WeeklyPanel
              week={selectedWeek}
              note={noteForSelectedWeek}
              isFirstTime={isFirstTime}
              hideNotes={settings.hideNotes}
              onAddNote={() => handleOpenComposer(false)}
              onEditNote={() => handleOpenComposer(true)}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              currentWeekKey={currentWeekKey}
              canEditNote={canEditNote(selectedWeekKey)}
              canReplay={canReplay}
              notesCount={notesCount}
              onStartReplay={handleStartReplay}
            />
          </div>
        </motion.div>
      </main>

      {/* Timeline */}
      <div className={`fixed bottom-0 left-0 right-0 lg:right-[420px] xl:right-[480px] z-30 bg-background/90 backdrop-blur-md border-t border-border`}>
        <Timeline
          weeks={weeks}
          currentWeekKey={currentWeekKey}
          selectedWeekKey={selectedWeekKey}
          onSelectWeek={handleWeekSelect}
        />
      </div>

      {/* Note Composer Modal */}
      <NoteComposer
        isOpen={isComposerOpen}
        onClose={() => { setIsComposerOpen(false); setIsEditing(false); }}
        onSave={isEditing ? handleEditNote : handleAddNote}
        weekKey={selectedWeekKey}
        existingNote={isEditing ? noteForSelectedWeek : undefined}
        isBackfill={selectedWeek?.isPast || false}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        notes={notes}
      />

      {/* Search & Filter */}
      <SearchFilter
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={notes}
        hideNotes={settings.hideNotes}
        onNoteClick={(note) => {
          setViewingNote(note);
          setIsSearchOpen(false);
        }}
      />

      {/* Note Viewer */}
      <NoteViewer
        note={viewingNote}
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
        hideContent={settings.hideNotes}
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, EyeOff, Search, Play, LogIn, WifiOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/contexts/AuthContext';
import WeeklyPanel from '@/components/WeeklyPanel';
import Timeline from '@/components/Timeline';
import NoteComposer from '@/components/NoteComposer';
import ReminderBanner from '@/components/ReminderBanner';
import SettingsModal from '@/components/SettingsModal';
import SearchFilter from '@/components/SearchFilter';
import NoteViewer from '@/components/NoteViewer';
import SyncPrompt from '@/components/SyncPrompt';
import GuestSyncCallout from '@/components/GuestSyncCallout';
import AccountMenu from '@/components/AccountMenu';
import { Note } from '@/lib/types';
import jarLogoImage from '@/assets/jar-hero.png';

export default function AppPage() {
  const navigate = useNavigate();
  const { user, isGuest, isLoading: authLoading } = useAuth();
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
    isLoading,
    isOnline,
    showSyncPrompt,
    guestNotesToSync,
    addNote, 
    updateNote,
    getNoteForWeek,
    canEditNote,
    updateSettings,
    dismissReminder,
    togglePrivacy,
    syncGuestNotes,
    dismissSyncPrompt,
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

  const handleAddNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    const newId = await addNote(noteData);
    if (newId) {
      setNewNoteId(newId);
      setTimeout(() => setNewNoteId(null), 2000);
    }
    setIsComposerOpen(false);
    setIsEditing(false);
  };

  const handleEditNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => {
    if (noteForSelectedWeek) {
      await updateNote(noteForSelectedWeek.id, {
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

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-caption">Loading your jar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sync Prompt for guest notes */}
      <SyncPrompt
        isOpen={showSyncPrompt}
        guestNotes={guestNotesToSync}
        onSync={syncGuestNotes}
        onDismiss={dismissSyncPrompt}
      />

      {/* Reminder Banner */}
      <AnimatePresence>
        {showReminder && !showSyncPrompt && (
          <ReminderBanner onDismiss={dismissReminder} onAddNote={() => handleOpenComposer(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`fixed left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border ${showReminder && !showSyncPrompt ? 'top-14' : 'top-0'}`}>
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="btn-ghost -ml-2 flex items-center gap-2">
            <img src={jarLogoImage} alt="Empty Jar" className="w-6 h-6 object-contain rounded" />
            <span className="font-display font-medium">Empty Jar</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Online/Offline indicator */}
            {!isOnline && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
            
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
            
            {/* Auth: Account menu or Sign in link */}
            {user ? (
              <AccountMenu />
            ) : (
              <Link 
                to="/auth/signin"
                className="btn-ghost p-2"
                title="Sign in"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
            
            <span className="text-caption ml-2">{currentYear}</span>
          </div>
        </div>
      </header>

      {/* Guest Sync Callout - replaces the old banner */}
      <div className={`fixed left-0 right-0 z-30 ${showReminder && !showSyncPrompt ? 'top-[7rem]' : 'top-16'}`}>
        <GuestSyncCallout isVisible={isGuest} />
      </div>

      {/* Main content */}
      <main className={`min-h-screen flex flex-col lg:flex-row pb-20 lg:pb-0 ${
        showReminder && !showSyncPrompt ? 'pt-[7.5rem]' : 'pt-16'
      } ${isGuest ? 'pt-[10rem]' : ''} ${isGuest && showReminder ? 'pt-[13rem]' : ''}`}>
        {/* Left: Jar Visual */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="lg:flex-1 h-[40vh] lg:h-auto lg:min-h-[calc(100vh-4rem)] relative flex items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(35 90% 95% / 0.5) 0%, transparent 70%)',
          }}
        >
          {/* Simple jar image instead of 3D */}
          <motion.div 
            className="relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src={jarLogoImage} 
              alt="Gratitude jar" 
              className="w-auto h-[200px] sm:h-[280px] lg:h-[360px] object-contain drop-shadow-xl"
            />
            {/* Notes count badge */}
            {notes.length > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 flex items-center gap-3">
                <span className="text-sm font-medium whitespace-nowrap">
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
            )}
          </motion.div>
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
      <div className="fixed bottom-0 left-0 right-0 lg:right-[420px] xl:right-[480px] z-30 bg-background/90 backdrop-blur-md border-t border-border">
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

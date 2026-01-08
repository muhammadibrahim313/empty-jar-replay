import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import WeeklyPanel from '@/components/WeeklyPanel';
import Timeline from '@/components/Timeline';
import NoteComposer from '@/components/NoteComposer';
import { Note } from '@/lib/types';

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
  const { 
    notes, 
    weeks, 
    currentWeek, 
    currentYear, 
    addNote, 
    getNoteForWeek,
    isFirstTime,
    canReplay,
    notesCount,
  } = useNotes();

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  const selectedWeekInfo = weeks.find(w => w.weekNumber === selectedWeek) || weeks[0];
  const noteForSelectedWeek = getNoteForWeek(selectedWeek, currentYear);

  const handleAddNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    addNote(noteData);
    // Trigger animation by setting new note id
    const newId = Date.now().toString();
    setNewNoteId(newId);
    setTimeout(() => setNewNoteId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="btn-ghost -ml-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display font-medium">Empty Jar</span>
          </Link>
          <span className="text-caption">{currentYear}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 min-h-screen flex flex-col lg:flex-row">
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
              className="w-full h-full"
              size="panel"
            />
          </Suspense>

          {/* Notes count overlay */}
          <div className="absolute bottom-6 left-6 glass-panel px-4 py-2">
            <span className="text-sm font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
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
              week={selectedWeekInfo}
              note={noteForSelectedWeek}
              isFirstTime={isFirstTime}
              onAddNote={() => setIsComposerOpen(true)}
              onPrevWeek={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              onNextWeek={() => setSelectedWeek(Math.min(52, selectedWeek + 1))}
              currentWeek={currentWeek}
              canReplay={canReplay}
              notesCount={notesCount}
            />
          </div>
        </motion.div>
      </main>

      {/* Timeline */}
      <div className="fixed bottom-0 left-0 right-0 lg:right-[420px] xl:right-[480px] z-30 bg-background/90 backdrop-blur-md border-t border-border">
        <Timeline
          weeks={weeks}
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />
      </div>

      {/* Note Composer Modal */}
      <NoteComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSave={handleAddNote}
        weekNumber={selectedWeek}
        year={currentYear}
      />
    </div>
  );
}

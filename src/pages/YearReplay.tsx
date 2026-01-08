import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import { Note, MOMENT_TYPES, MOOD_COLORS, MOOD_LABELS } from '@/lib/types';
import { parseWeekKey, formatDateRange, getWeekStart, getWeekEnd } from '@/lib/storage';

export default function YearReplay() {
  const { sortedNotes, canReplay, settings } = useNotes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(!settings.hideNotes);

  if (!canReplay || sortedNotes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-heading mb-4">Not enough notes yet</h1>
          <p className="text-muted-foreground mb-6">You need at least 10 notes to unlock the year replay.</p>
          <Link to="/app" className="btn-primary">Back to app</Link>
        </div>
      </div>
    );
  }

  const currentNote = sortedNotes[currentIndex];
  const { weekNumber, year } = parseWeekKey(currentNote.weekKey);
  const weekStart = getWeekStart(weekNumber, year);
  const weekEnd = getWeekEnd(weekStart);
  const momentType = MOMENT_TYPES.find(t => t.value === currentNote.momentType);
  const progress = ((currentIndex + 1) / sortedNotes.length) * 100;

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, sortedNotes.length - 1));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/app" className="btn-ghost -ml-2">
            <X className="w-4 h-4" />
            <span>Exit replay</span>
          </Link>
          <span className="text-caption">{currentIndex + 1} / {sortedNotes.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-20 pb-24 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNote.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
          >
            <div className="glass-panel p-8 relative">
              {/* Privacy overlay */}
              {settings.hideNotes && !isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl z-10">
                  <button onClick={() => setIsRevealed(true)} className="btn-secondary">Reveal note</button>
                </div>
              )}

              <div className={settings.hideNotes && !isRevealed ? 'blur-md' : ''}>
                {/* Week info */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: MOOD_COLORS[currentNote.mood - 1] }} />
                    <span className="text-overline">Week {weekNumber}</span>
                  </div>
                  <p className="text-caption">{formatDateRange(weekStart, weekEnd)}</p>
                </div>

                {/* Title */}
                {currentNote.title && (
                  <h2 className="text-heading text-center mb-4">{currentNote.title}</h2>
                )}

                {/* Body */}
                <p className="text-body-lg text-center leading-relaxed">{currentNote.body}</p>

                {/* Meta */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
                  <span className="text-sm">{MOOD_LABELS[currentNote.mood - 1]}</span>
                  {momentType && <span>{momentType.emoji} {momentType.label}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border">
        <div className="container-wide flex items-center justify-between py-4">
          <motion.button onClick={goPrev} disabled={currentIndex === 0} className="btn-secondary disabled:opacity-30" whileTap={{ scale: 0.95 }}>
            <ChevronLeft className="w-5 h-5" /> Previous
          </motion.button>
          <motion.button onClick={goNext} disabled={currentIndex === sortedNotes.length - 1} className="btn-primary" whileTap={{ scale: 0.95 }}>
            Next <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

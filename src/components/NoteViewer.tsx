import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock } from 'lucide-react';
import { Note, MOMENT_TYPES, MOOD_COLORS, MOOD_LABELS } from '@/lib/types';
import { parseWeekKey, formatDateRange, getWeekStart, getWeekEnd } from '@/lib/storage';

interface NoteViewerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  hideContent: boolean;
}

export default function NoteViewer({ 
  note, 
  isOpen, 
  onClose,
  hideContent,
}: NoteViewerProps) {
  const [revealed, setRevealed] = useState(false);

  if (!note) return null;

  const { weekNumber, year } = parseWeekKey(note.weekKey);
  const weekStart = getWeekStart(weekNumber, year);
  const weekEnd = getWeekEnd(weekStart);
  const momentType = MOMENT_TYPES.find(t => t.value === note.momentType);
  const isHidden = hideContent && !revealed;

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleClose = () => {
    setRevealed(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-panel h-full md:h-auto max-h-[90vh] overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-overline">Week {weekNumber}, {year}</span>
                    {note.isBackfill && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        <Clock className="w-3 h-3" />
                        Backfilled
                      </span>
                    )}
                  </div>
                  <p className="text-caption mt-1">{formatDateRange(weekStart, weekEnd)}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="btn-ghost p-2 -mr-2 -mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Privacy reveal overlay */}
              {isHidden && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-2xl">
                  <motion.button
                    onClick={handleReveal}
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    Reveal this note
                  </motion.button>
                </div>
              )}

              {/* Content */}
              <div className={isHidden ? 'blur-md select-none' : ''}>
                {note.title && (
                  <h2 className="text-heading mb-4">{note.title}</h2>
                )}

                <p className="text-body-lg leading-relaxed whitespace-pre-wrap">
                  {note.body}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border">
                  {/* Mood */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: MOOD_COLORS[note.mood - 1] }}
                    />
                    <span className="text-sm">{MOOD_LABELS[note.mood - 1]}</span>
                  </div>

                  {/* Moment type */}
                  {momentType && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{momentType.emoji}</span>
                      <span className="text-sm">{momentType.label}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags.map(tag => (
                      <span key={tag} className="tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-caption mt-6">
                  Created: {new Date(note.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {note.updatedAt !== note.createdAt && (
                    <span className="ml-2">
                      • Edited: {new Date(note.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="btn-primary w-full mt-8"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

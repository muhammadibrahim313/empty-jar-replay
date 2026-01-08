import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Note, MomentType } from '@/lib/types';
import { parseWeekKey, getWeekStart, getWeekEnd, formatDateRange } from '@/lib/storage';
import MoodSelector from './MoodSelector';
import MomentTypeSelector from './MomentTypeSelector';

interface NoteComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isBackfill'>) => void;
  weekKey: string;
  existingNote?: Note;
  isBackfill?: boolean;
}

const SUGGESTED_TAGS = ['gratitude', 'growth', 'joy', 'peace', 'adventure', 'connection', 'milestone', 'everyday'];

export default function NoteComposer({ 
  isOpen, 
  onClose, 
  onSave, 
  weekKey,
  existingNote,
  isBackfill = false,
}: NoteComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [momentType, setMomentType] = useState<MomentType>('small-win');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { weekNumber, year } = parseWeekKey(weekKey);
  const weekStart = getWeekStart(weekNumber, year);
  const weekEnd = getWeekEnd(weekStart);
  const dateRange = formatDateRange(weekStart, weekEnd);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '');
      setBody(existingNote.body);
      setMood(existingNote.mood);
      setMomentType(existingNote.momentType);
      setSelectedTags(existingNote.tags);
    } else {
      setTitle('');
      setBody('');
      setMood(4);
      setMomentType('small-win');
      setSelectedTags([]);
    }
  }, [existingNote, isOpen]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!body.trim()) return;
    
    onSave({
      weekKey,
      title: title.trim() || undefined,
      body: body.trim(),
      mood,
      momentType,
      tags: selectedTags,
    });
  };

  const prompt = isBackfill
    ? "What moment from this week do you want to remember?"
    : "What's one thing you're grateful for this week?";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-[40%] md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 flex flex-col"
          >
            <div className="glass-panel flex flex-col max-h-[90vh] md:max-h-none">
              {/* Header - Compact */}
              <div className="flex items-start justify-between p-4 md:p-5 border-b border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-overline">Week {weekNumber}</span>
                    {isBackfill && (
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        Backfill
                      </span>
                    )}
                    <span className="text-caption">•</span>
                    <span className="text-caption">{dateRange}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-heading">
                      {existingNote ? 'Edit note' : 'Add a note'}
                    </h2>
                    <span className="text-caption flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {prompt}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn-ghost p-2 -mr-2 -mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form - 2 Column Grid on Desktop */}
              <div className="p-4 md:p-5 overflow-y-auto md:overflow-visible flex-1">
                <div className="md:grid md:grid-cols-2 md:gap-5 space-y-4 md:space-y-0">
                  {/* Left Column - Text Inputs */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Give it a title (optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-premium text-base font-display"
                    />
                    <textarea
                      placeholder="Write your note..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={5}
                      className="input-premium resize-none"
                    />
                  </div>

                  {/* Right Column - Selectors */}
                  <div className="space-y-4">
                    <MoodSelector value={mood} onChange={setMood} />
                    <MomentTypeSelector value={momentType} onChange={setMomentType} />
                    
                    {/* Tags - Compact */}
                    <div className="space-y-1.5">
                      <label className="text-caption block">Add tags</label>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_TAGS.map((tag) => (
                          <motion.button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`tag-chip text-xs ${selectedTags.includes(tag) ? 'selected' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            #{tag}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Fixed at bottom */}
              <div className="flex gap-3 p-4 md:p-5 border-t border-border bg-card/80">
                <button onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!body.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {existingNote ? 'Save changes' : 'Save to jar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

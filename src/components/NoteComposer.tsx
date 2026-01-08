import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Note, MomentType } from '@/lib/types';
import MoodSelector from './MoodSelector';
import MomentTypeSelector from './MomentTypeSelector';

interface NoteComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  weekNumber: number;
  year: number;
  prompt?: string;
}

const SUGGESTED_TAGS = ['gratitude', 'growth', 'joy', 'peace', 'adventure', 'connection', 'milestone', 'everyday'];

export default function NoteComposer({ 
  isOpen, 
  onClose, 
  onSave, 
  weekNumber, 
  year,
  prompt = "What's one thing you're grateful for this week?"
}: NoteComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [momentType, setMomentType] = useState<MomentType>('small-win');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      weekNumber,
      year,
      title: title.trim() || undefined,
      body: body.trim(),
      mood,
      momentType,
      tags: selectedTags,
    });

    // Reset form
    setTitle('');
    setBody('');
    setMood(4);
    setMomentType('small-win');
    setSelectedTags([]);
    onClose();
  };

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="glass-panel h-full md:h-auto max-h-[90vh] overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-overline">Week {weekNumber}</span>
                  <h2 className="text-heading mt-1">Add a note</h2>
                </div>
                <button
                  onClick={onClose}
                  className="btn-ghost p-2 -mr-2 -mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prompt */}
              <div className="mb-6 p-4 rounded-xl bg-secondary/50 border border-secondary">
                <div className="flex items-center gap-2 text-secondary-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">{prompt}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* Title (optional) */}
                <div>
                  <input
                    type="text"
                    placeholder="Give it a title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-premium text-lg font-display"
                  />
                </div>

                {/* Body */}
                <div>
                  <textarea
                    placeholder="Write your note..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="input-premium resize-none"
                  />
                </div>

                {/* Mood */}
                <MoodSelector value={mood} onChange={setMood} />

                {/* Moment Type */}
                <MomentTypeSelector value={momentType} onChange={setMomentType} />

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-caption block">Add tags</label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <motion.button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        #{tag}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!body.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save to jar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

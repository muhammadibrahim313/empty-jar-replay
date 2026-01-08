import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Filter } from 'lucide-react';
import { Note, MOMENT_TYPES, MOOD_COLORS, MOOD_LABELS } from '@/lib/types';
import { filterNotes, getAllTags, parseWeekKey, formatDateRange, getWeekStart, getWeekEnd } from '@/lib/storage';

interface SearchFilterProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  hideNotes: boolean;
  onNoteClick: (note: Note) => void;
}

export default function SearchFilter({ 
  isOpen, 
  onClose, 
  notes, 
  hideNotes,
  onNoteClick,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<(1 | 2 | 3 | 4 | 5)[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => getAllTags(notes), [notes]);

  const filteredNotes = useMemo(() => {
    return filterNotes(notes, {
      searchQuery,
      moods: selectedMoods.length > 0 ? selectedMoods : undefined,
      momentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    }).sort((a, b) => b.weekKey.localeCompare(a.weekKey)); // Most recent first
  }, [notes, searchQuery, selectedMoods, selectedTypes, selectedTags]);

  const toggleMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    setSelectedMoods(prev => 
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMoods([]);
    setSelectedTypes([]);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedMoods.length > 0 || selectedTypes.length > 0 || selectedTags.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading">Search Notes</h2>
                <button onClick={onClose} className="btn-ghost p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium pl-10"
                  autoFocus
                />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`mt-3 btn-ghost text-sm ${showFilters ? 'text-primary' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary text-primary-foreground">
                    Active
                  </span>
                )}
              </button>

              {/* Filters panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      {/* Mood filter */}
                      <div>
                        <label className="text-caption block mb-2">Mood</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((mood) => (
                            <button
                              key={mood}
                              onClick={() => toggleMood(mood as 1 | 2 | 3 | 4 | 5)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                selectedMoods.includes(mood as 1 | 2 | 3 | 4 | 5)
                                  ? 'border-foreground scale-110'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: MOOD_COLORS[mood - 1] }}
                              title={MOOD_LABELS[mood - 1]}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Moment type filter */}
                      <div>
                        <label className="text-caption block mb-2">Type</label>
                        <div className="flex flex-wrap gap-2">
                          {MOMENT_TYPES.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => toggleType(type.value)}
                              className={`tag-chip ${selectedTypes.includes(type.value) ? 'selected' : ''}`}
                            >
                              {type.emoji} {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tags filter */}
                      {allTags.length > 0 && (
                        <div>
                          <label className="text-caption block mb-2">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clear filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No notes found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => {
                    const { weekNumber, year } = parseWeekKey(note.weekKey);
                    const weekStart = getWeekStart(weekNumber, year);
                    const weekEnd = getWeekEnd(weekStart);
                    const momentType = MOMENT_TYPES.find(t => t.value === note.momentType);

                    return (
                      <motion.button
                        key={note.id}
                        onClick={() => onNoteClick(note)}
                        className="w-full text-left glass-panel p-4 hover:shadow-medium transition-shadow"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-overline">
                            Week {weekNumber} • {formatDateRange(weekStart, weekEnd)}
                          </span>
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: MOOD_COLORS[note.mood - 1] }}
                          />
                        </div>
                        
                        {note.title && (
                          <h4 className={`font-display font-medium mb-1 ${hideNotes ? 'blur-sm' : ''}`}>
                            {note.title}
                          </h4>
                        )}
                        
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${hideNotes ? 'blur-sm' : ''}`}>
                          {note.body}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          {momentType && (
                            <span className="text-xs">{momentType.emoji}</span>
                          )}
                          {note.isBackfill && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                              Backfilled
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-caption text-center">
                {filteredNotes.length} of {notes.length} notes
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

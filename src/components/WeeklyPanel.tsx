import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Sparkles, Calendar, Play } from 'lucide-react';
import { Note, WeekInfo, MOMENT_TYPES, MOOD_COLORS, MOOD_LABELS } from '@/lib/types';

interface WeeklyPanelProps {
  week: WeekInfo;
  note?: Note;
  isFirstTime: boolean;
  onAddNote: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  currentWeek: number;
  canReplay: boolean;
  notesCount: number;
}

const PROMPTS = [
  "What's one thing you're grateful for this week?",
  "What made you smile recently?",
  "What's a small win you can celebrate?",
  "Who made a difference in your week?",
  "What did you learn this week?",
  "What's something beautiful you noticed?",
];

export default function WeeklyPanel({ 
  week, 
  note, 
  isFirstTime,
  onAddNote, 
  onPrevWeek, 
  onNextWeek,
  currentWeek,
  canReplay,
  notesCount,
}: WeeklyPanelProps) {
  const prompt = useMemo(() => {
    return PROMPTS[week.weekNumber % PROMPTS.length];
  }, [week.weekNumber]);

  const formatDateRange = (start: Date, end: Date) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
  };

  const isCurrentWeek = week.weekNumber === currentWeek;
  const isFuture = week.weekNumber > currentWeek;
  const momentType = note ? MOMENT_TYPES.find(t => t.value === note.momentType) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={onPrevWeek}
          disabled={week.weekNumber <= 1}
          className="btn-ghost p-2 disabled:opacity-30"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <span className="text-overline">Week {week.weekNumber}</span>
          <h2 className="text-subheading mt-1">
            {formatDateRange(week.startDate, week.endDate)}
          </h2>
          {isCurrentWeek && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary font-medium">
              <Calendar className="w-3.5 h-3.5" />
              This week
            </span>
          )}
        </div>

        <motion.button
          onClick={onNextWeek}
          disabled={week.weekNumber >= 52}
          className="btn-ghost p-2 disabled:opacity-30"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isFuture ? (
          /* Future week */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              This week hasn't arrived yet.
            </p>
            <p className="text-caption mt-2">
              Come back when it's time.
            </p>
          </motion.div>
        ) : note ? (
          /* Existing note */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Note card */}
            <div className="glass-panel p-6">
              {note.title && (
                <h3 className="text-xl font-display font-medium mb-2">
                  {note.title}
                </h3>
              )}
              <p className="text-body text-foreground/90 leading-relaxed">
                {note.body}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                {/* Mood */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: MOOD_COLORS[note.mood - 1] }}
                  />
                  <span className="text-caption">{MOOD_LABELS[note.mood - 1]}</span>
                </div>

                {/* Moment type */}
                {momentType && (
                  <div className="flex items-center gap-1.5">
                    <span>{momentType.emoji}</span>
                    <span className="text-caption">{momentType.label}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-caption text-primary">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : isFirstTime ? (
          /* First time user */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-heading mb-2">Welcome to your jar</h3>
            <p className="text-body-lg text-muted-foreground max-w-sm mx-auto mb-6">
              One note a week. Fifty-two chances to pause and appreciate what matters.
            </p>
            <motion.button
              onClick={onAddNote}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add your first note
            </motion.button>
          </motion.div>
        ) : (
          /* No note for this week */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            {/* Prompt */}
            <div className="glass-panel p-6 mb-6 text-left">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-caption text-primary font-medium">This week's prompt</span>
              </div>
              <p className="text-subheading text-foreground">
                {prompt}
              </p>
            </div>

            <motion.button
              onClick={onAddNote}
              className="btn-primary w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Plus className="w-4 h-4" />
              Add this week's note
            </motion.button>

            {/* Missed week hint */}
            {!isCurrentWeek && (
              <p className="text-caption mt-4">
                It's okay to add notes for past weeks. Your memories are still valid.
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Year replay section */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-caption">
              {notesCount} note{notesCount !== 1 ? 's' : ''} this year
            </span>
            {!canReplay && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {10 - notesCount} more to unlock year replay
              </p>
            )}
          </div>
          <motion.button
            disabled={!canReplay}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
            whileHover={canReplay ? { scale: 1.02 } : {}}
            whileTap={canReplay ? { scale: 0.98 } : {}}
          >
            <Play className="w-3.5 h-3.5" />
            Replay year
          </motion.button>
        </div>
      </div>
    </div>
  );
}

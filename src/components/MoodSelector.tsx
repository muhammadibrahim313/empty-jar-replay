import { motion } from 'framer-motion';
import { MOOD_COLORS, MOOD_LABELS } from '@/lib/types';

interface MoodSelectorProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-caption block">How are you feeling?</label>
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((mood) => (
          <motion.button
            key={mood}
            type="button"
            onClick={() => onChange(mood as 1 | 2 | 3 | 4 | 5)}
            className={`mood-dot ${value === mood ? 'selected' : ''}`}
            style={{ backgroundColor: MOOD_COLORS[mood - 1] }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={MOOD_LABELS[mood - 1]}
          >
            {value === mood && (
              <motion.div
                layoutId="mood-indicator"
                className="w-2 h-2 bg-white rounded-full shadow-sm"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {MOOD_LABELS[value - 1]}
        </span>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { WeekInfo } from '@/lib/types';

interface TimelineProps {
  weeks: WeekInfo[];
  currentWeek: number;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
}

export default function Timeline({ weeks, currentWeek, selectedWeek, onSelectWeek }: TimelineProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption">Jan</span>
        <span className="text-caption">Dec</span>
      </div>
      
      <div className="relative">
        {/* Background track */}
        <div className="absolute inset-0 h-px top-1/2 -translate-y-1/2 bg-border" />
        
        {/* Weeks */}
        <div className="relative flex items-center justify-between">
          {weeks.map((week) => {
            const isActive = week.weekNumber === selectedWeek;
            const isCurrent = week.weekNumber === currentWeek;
            const isFilled = week.hasNote;
            const isFuture = week.weekNumber > currentWeek;

            return (
              <motion.button
                key={week.weekNumber}
                onClick={() => !isFuture && onSelectWeek(week.weekNumber)}
                disabled={isFuture}
                className={`
                  timeline-marker relative
                  ${isActive ? 'active' : ''}
                  ${isFilled ? 'filled' : ''}
                  ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-150'}
                `}
                whileHover={!isFuture ? { scale: 1.5 } : {}}
                whileTap={!isFuture ? { scale: 0.9 } : {}}
                title={`Week ${week.weekNumber}${isCurrent ? ' (This week)' : ''}${isFilled ? ' - Note added' : ''}`}
              >
                {/* Current week indicator */}
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-2 rounded-full border-2 border-primary/40"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                )}
                
                {/* Glow for filled weeks */}
                {isFilled && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, hsl(35 90% 65% / 0.4) 0%, transparent 70%)',
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Week label */}
      <div className="text-center mt-4">
        <span className="text-caption">
          Week {selectedWeek} of 52
          {selectedWeek === currentWeek && (
            <span className="ml-2 text-primary font-medium">• This week</span>
          )}
        </span>
      </div>
    </div>
  );
}

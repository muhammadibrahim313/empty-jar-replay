import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface ReminderBannerProps {
  onDismiss: () => void;
  onAddNote: () => void;
}

export default function ReminderBanner({ onDismiss, onAddNote }: ReminderBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground"
    >
      <div className="container-wide flex items-center justify-between h-14 gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">
            It's time for your weekly reflection!
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onAddNote}
            className="px-4 py-1.5 rounded-lg bg-primary-foreground text-primary text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add note
          </motion.button>
          <button 
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-primary-foreground/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Note } from '@/lib/types';

interface SyncPromptProps {
  isOpen: boolean;
  guestNotes: Note[];
  onSync: () => void;
  onDismiss: () => void;
}

export default function SyncPrompt({ isOpen, guestNotes, onSync, onDismiss }: SyncPromptProps) {
  if (!isOpen || guestNotes.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-50"
          >
            <div className="glass-panel p-6 md:p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-display font-medium mb-2">
                  Sync your notes?
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  You have <strong>{guestNotes.length}</strong> note{guestNotes.length !== 1 ? 's' : ''} saved locally. 
                  Would you like to sync them to your account?
                </p>

                <div className="flex gap-3">
                  <button onClick={onDismiss} className="btn-secondary flex-1">
                    <X className="w-4 h-4" />
                    Skip
                  </button>
                  <button onClick={onSync} className="btn-primary flex-1">
                    <Upload className="w-4 h-4" />
                    Sync notes
                  </button>
                </div>

                <p className="text-caption mt-4">
                  You can only sync once. Local notes will be cleared after syncing.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

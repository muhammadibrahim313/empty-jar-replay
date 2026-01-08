import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const handleOpenForm = () => {
    window.open(APP_CONFIG.FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer');
  };

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

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm pointer-events-auto"
            >
              <div className="glass-panel p-6 md:p-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 btn-ghost p-2"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="text-xl font-display font-medium mb-2">
                    Help improve Empty Jar
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    This takes under 30 seconds.
                  </p>

                  <button
                    onClick={handleOpenForm}
                    className="btn-primary w-full mb-3"
                  >
                    Open feedback form
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <p className="text-caption">
                    Opens in a new tab
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

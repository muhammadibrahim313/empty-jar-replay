import { useEffect, useCallback } from 'react';
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

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/15 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal container - centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ 
                type: 'spring', 
                damping: 28, 
                stiffness: 350,
                mass: 0.8
              }}
              className="w-full max-w-md pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              {/* Card */}
              <div className="relative bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Content */}
                <div className="px-8 py-10 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>

                  {/* Title */}
                  <h2 
                    id="feedback-title"
                    className="text-xl font-display font-medium text-foreground mb-2"
                  >
                    Help improve Empty Jar
                  </h2>

                  {/* Subtitle */}
                  <p className="text-muted-foreground mb-8">
                    This takes under 30 seconds.
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={handleOpenForm}
                    className="w-full btn-primary py-3.5 text-base group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <span>Open feedback form</span>
                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Helper text */}
                  <p className="text-xs text-muted-foreground mt-4">
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

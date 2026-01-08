import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FeedbackModal from './FeedbackModal';

export default function AccountMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handleSignOut = async () => {
    handleClose();
    await signOut();
  };

  const handleFeedback = () => {
    handleClose();
    setIsFeedbackOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || 'Your account';
  const email = user.email || '';
  const initials = displayName !== 'Your account' 
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase() || 'U';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="btn-ghost p-2 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-xs font-medium text-primary">{initials}</span>
          </div>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-3 w-72 z-50"
              role="menu"
              aria-orientation="vertical"
            >
              {/* Caret arrow */}
              <div className="absolute -top-2 right-4 w-4 h-4 rotate-45 bg-card border-l border-t border-border" />
              
              {/* Card container */}
              <div className="relative bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
                {/* User info section */}
                <div className="p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mx-3" />

                {/* Menu items */}
                <div className="p-2">
                  <button
                    onClick={handleFeedback}
                    onKeyDown={(e) => handleKeyDown(e, handleFeedback)}
                    className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-muted/60 transition-colors flex items-center gap-3 focus:outline-none focus-visible:bg-muted/60"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Feedback</span>
                  </button>
                </div>

                {/* Sign out section */}
                <div className="h-px bg-border mx-3" />
                
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    onKeyDown={(e) => handleKeyDown(e, handleSignOut)}
                    className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-muted/60 transition-colors flex items-center gap-3 focus:outline-none focus-visible:bg-muted/60 group"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center group-hover:bg-accent/10">
                      <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">Sign out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}

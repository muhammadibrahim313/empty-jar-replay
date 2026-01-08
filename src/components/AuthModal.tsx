import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await signInWithMagicLink(email);
    
    setIsSubmitting(false);
    
    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-50"
          >
            <div className="glass-panel h-full md:h-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-medium">Sign in</h2>
                    <p className="text-caption">to sync your jar</p>
                  </div>
                </div>
                <button onClick={handleClose} className="btn-ghost p-2 -mr-2 -mt-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Mail className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-medium mb-2">Check your email</h3>
                  <p className="text-muted-foreground text-sm">
                    We sent a magic link to <strong>{email}</strong>. Click it to sign in.
                  </p>
                  <button onClick={handleClose} className="btn-secondary mt-6">
                    Got it
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption block mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-premium"
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                        />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send magic link
                      </>
                    )}
                  </button>

                  <p className="text-center text-caption">
                    No password needed. We'll email you a secure sign-in link.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

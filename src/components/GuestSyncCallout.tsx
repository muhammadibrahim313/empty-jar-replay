import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuestSyncCalloutProps {
  isVisible: boolean;
}

export default function GuestSyncCallout({ isVisible }: GuestSyncCalloutProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full flex justify-center px-4 py-3"
    >
      <div className="glass-panel px-5 py-4 max-w-md w-full flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">Sync your jar</h4>
          <p className="text-caption mb-3">
            Keep your notes safe across devices.
          </p>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/auth/signup" 
              className="btn-primary text-sm py-1.5 px-3"
            >
              Create account
            </Link>
            <Link 
              to="/auth/signin" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

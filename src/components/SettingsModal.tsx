import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { AppSettings, Note, DAY_NAMES } from '@/lib/types';
import { exportNotesToPDF } from '@/lib/pdfExport';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  notes: Note[];
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  notes,
}: SettingsModalProps) {
  const handleExportPDF = () => {
    exportNotesToPDF(notes);
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="glass-panel h-full md:h-auto max-h-[90vh] overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading">Settings</h2>
                <button onClick={onClose} className="btn-ghost p-2 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Reminder Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Weekly Reminder</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption block mb-2">Day</label>
                      <select
                        value={settings.reminderDay}
                        onChange={(e) => onUpdateSettings({ reminderDay: Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 })}
                        className="input-premium py-2"
                      >
                        {DAY_NAMES.map((day, index) => (
                          <option key={day} value={index}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-caption block mb-2">Time</label>
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => onUpdateSettings({ reminderTime: e.target.value })}
                        className="input-premium py-2"
                      />
                    </div>
                  </div>
                  
                  <p className="text-caption">
                    You'll see a reminder banner when you open the app on {DAY_NAMES[settings.reminderDay]}s after {settings.reminderTime}.
                  </p>
                </div>

                {/* Accessibility */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground">Accessibility</h3>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm">Reduced motion</span>
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                      className="w-5 h-5 rounded accent-primary"
                    />
                  </label>
                </div>

                {/* Export */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground">Export</h3>
                  
                  <button
                    onClick={handleExportPDF}
                    disabled={notes.length === 0}
                    className="btn-secondary w-full disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Export all notes as PDF
                  </button>
                  
                  <p className="text-caption">
                    Download a beautifully formatted PDF of all {notes.length} notes.
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="btn-primary w-full mt-8"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

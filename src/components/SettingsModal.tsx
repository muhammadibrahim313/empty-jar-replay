import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, Bell } from 'lucide-react';
import { AppSettings, Note, DAY_NAMES } from '@/lib/types';
import { exportNotesToPDF } from '@/lib/pdfExport';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  notes: Note[];
}

// Common timezones for dropdown
const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  notes,
}: SettingsModalProps) {
  const { user } = useAuth();
  
  const handleExportPDF = () => {
    exportNotesToPDF(notes);
  };

  // Detect user's timezone
  const detectedTimezone = useMemo(() => 
    Intl.DateTimeFormat().resolvedOptions().timeZone, 
  []);

  // Include detected timezone if not in common list
  const timezoneOptions = useMemo(() => {
    const options = [...COMMON_TIMEZONES];
    if (!options.includes(detectedTimezone)) {
      options.unshift(detectedTimezone);
    }
    if (!options.includes(settings.timezone)) {
      options.unshift(settings.timezone);
    }
    return [...new Set(options)].sort();
  }, [detectedTimezone, settings.timezone]);

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
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="glass-panel max-h-[90vh] overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading">Settings</h2>
                <button onClick={onClose} className="btn-ghost p-2 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Email Reminders - Only show for logged in users */}
                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Email Reminders</h3>
                    </div>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Enable weekly email reminders</span>
                      <input
                        type="checkbox"
                        checked={settings.emailRemindersEnabled}
                        onChange={(e) => onUpdateSettings({ emailRemindersEnabled: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                    </label>
                    
                    {settings.emailRemindersEnabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-caption block mb-2">Day</label>
                            <select
                              value={settings.emailReminderDay}
                              onChange={(e) => onUpdateSettings({ emailReminderDay: e.target.value as 'Sunday' | 'Monday' })}
                              className="input-premium py-2"
                            >
                              <option value="Sunday">Sunday</option>
                              <option value="Monday">Monday</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-caption block mb-2">Time</label>
                            <input
                              type="time"
                              value={settings.emailReminderTime}
                              onChange={(e) => onUpdateSettings({ emailReminderTime: e.target.value })}
                              className="input-premium py-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-caption block mb-2">Timezone</label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => onUpdateSettings({ timezone: e.target.value })}
                            className="input-premium py-2"
                          >
                            {timezoneOptions.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <p className="text-caption">
                          We only email once per week. You can turn this off anytime.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* In-App Reminder Settings */}
                <div className={`space-y-4 ${user ? 'pt-4 border-t border-border' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">In-App Reminder</h3>
                  </div>
                  
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

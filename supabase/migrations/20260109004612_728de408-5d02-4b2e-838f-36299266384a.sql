-- Add email reminder columns to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS email_reminders_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_reminder_day text DEFAULT 'Sunday',
ADD COLUMN IF NOT EXISTS email_reminder_time text DEFAULT '19:00',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS last_reminder_sent_week_key text;

-- Add index for efficient querying of users needing reminders
CREATE INDEX IF NOT EXISTS idx_settings_email_reminders 
ON public.settings (email_reminders_enabled, email_reminder_day, email_reminder_time) 
WHERE email_reminders_enabled = true;
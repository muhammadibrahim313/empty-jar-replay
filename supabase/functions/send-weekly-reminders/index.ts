import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email subject rotation
const SUBJECT_OPTIONS = [
  "Your Empty Jar reminder 🫙",
  "One note for this week ✨",
  "A quick check-in from Empty Jar 💭",
];

// Get current week key for a timezone
function getWeekKeyForTimezone(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '');
    
    const localDate = new Date(year, month, day);
    const d = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekYear = d.getUTCFullYear();
    return `${weekYear}-${weekNum.toString().padStart(2, '0')}`;
  } catch (e) {
    console.error('Error getting week key for timezone:', e);
    // Fallback to UTC
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const year = d.getUTCFullYear();
    return `${year}-${weekNum.toString().padStart(2, '0')}`;
  }
}

// Check if current time matches reminder time in user's timezone
function isReminderTimeNow(reminderDay: string, reminderTime: string, timezone: string): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const currentDay = parts.find(p => p.type === 'weekday')?.value;
    const currentHour = parts.find(p => p.type === 'hour')?.value?.padStart(2, '0');
    const currentMinute = parts.find(p => p.type === 'minute')?.value?.padStart(2, '0');
    
    const [reminderHour] = reminderTime.split(':');
    
    // Check if it's the right day and within the hour window
    return currentDay === reminderDay && currentHour === reminderHour.padStart(2, '0');
  } catch (e) {
    console.error('Error checking reminder time:', e);
    return false;
  }
}

// Generate email HTML
function generateEmailHtml(userName: string | null, appUrl: string): string {
  const greeting = userName ? `Hi ${userName}` : 'Hi there';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Empty Jar Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf9f7; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 8px;">🫙</div>
      <h1 style="color: #2d3748; font-size: 24px; font-weight: 600; margin: 0;">Empty Jar</h1>
    </div>
    
    <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin-bottom: 8px;">
      ${greeting} 👋
    </p>
    
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
      Take 60 seconds and add this week's note. What made you smile? What did you learn? Capture it before it slips away.
    </p>
    
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${appUrl}/app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Add this week's note →
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    
    <p style="color: #a0aec0; font-size: 13px; text-align: center; margin: 0;">
      You're receiving this because weekly reminders are on.<br>
      <a href="${appUrl}/app" style="color: #667eea; text-decoration: underline;">Turn off in Settings</a>
    </p>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for test mode
    let testEmail: string | null = null;
    try {
      const body = await req.json();
      if (body.test && body.email) {
        testEmail = body.email;
        console.log(`Test mode: Sending test email to ${testEmail}`);
        
        const appUrl = "https://bgqwtrpxdoputisbzilt.lovableproject.com";
        const subject = "🧪 Test: " + SUBJECT_OPTIONS[0];
        
        const { error: emailError } = await resend.emails.send({
          from: "Empty Jar <no-reply@empty-jar.ibrahimqasmi.com>",
          reply_to: "support@empty-jar.ibrahimqasmi.com",
          to: [testEmail!],
          subject: subject,
          html: generateEmailHtml("Test User", appUrl),
        });

        if (emailError) {
          console.error("Test email error:", emailError);
          return new Response(
            JSON.stringify({ success: false, error: emailError }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        console.log(`Test email sent successfully to ${testEmail}`);
        return new Response(
          JSON.stringify({ success: true, message: `Test email sent to ${testEmail}` }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } catch (e) {
      // Not JSON or no test mode, continue with normal flow
    }

    console.log("Starting weekly reminder check...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = supabaseUrl.includes("localhost") 
      ? "http://localhost:5173" 
      : "https://bgqwtrpxdoputisbzilt.lovableproject.com";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with email reminders enabled
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("user_id, email_reminder_day, email_reminder_time, timezone, last_reminder_sent_week_key")
      .eq("email_reminders_enabled", true);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    console.log(`Found ${settingsData?.length || 0} users with reminders enabled`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const settings of settingsData || []) {
      const { user_id, email_reminder_day, email_reminder_time, timezone, last_reminder_sent_week_key } = settings;
      
      // Get current week key in user's timezone
      const currentWeekKey = getWeekKeyForTimezone(timezone || 'America/New_York');
      
      // Skip if we already sent a reminder for this week
      if (last_reminder_sent_week_key === currentWeekKey) {
        console.log(`User ${user_id}: Already sent reminder for week ${currentWeekKey}`);
        emailsSkipped++;
        continue;
      }

      // Check if it's the right time
      if (!isReminderTimeNow(email_reminder_day || 'Sunday', email_reminder_time || '19:00', timezone || 'America/New_York')) {
        console.log(`User ${user_id}: Not reminder time yet`);
        emailsSkipped++;
        continue;
      }

      // Check if user already has a note for this week
      const { data: noteData } = await supabase
        .from("notes")
        .select("id")
        .eq("user_id", user_id)
        .eq("week_key", currentWeekKey)
        .single();

      if (noteData) {
        console.log(`User ${user_id}: Already has note for week ${currentWeekKey}`);
        emailsSkipped++;
        continue;
      }

      // Get user email and name
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
      
      if (userError || !userData?.user?.email) {
        console.error(`Error fetching user ${user_id}:`, userError);
        continue;
      }

      // Check if email is verified
      if (!userData.user.email_confirmed_at) {
        console.log(`User ${user_id}: Email not verified`);
        emailsSkipped++;
        continue;
      }

      const userEmail = userData.user.email;
      const userName = userData.user.user_metadata?.full_name || null;

      // Select random subject
      const subject = SUBJECT_OPTIONS[Math.floor(Math.random() * SUBJECT_OPTIONS.length)];

      // Send email
      console.log(`Sending reminder to ${userEmail}...`);
      
      const { error: emailError } = await resend.emails.send({
        from: "Empty Jar <no-reply@empty-jar.ibrahimqasmi.com>",
        reply_to: "support@empty-jar.ibrahimqasmi.com",
        to: [userEmail],
        subject: subject,
        html: generateEmailHtml(userName, appUrl),
      });

      if (emailError) {
        console.error(`Error sending email to ${userEmail}:`, emailError);
        continue;
      }

      // Update last_reminder_sent_week_key
      await supabase
        .from("settings")
        .update({ last_reminder_sent_week_key: currentWeekKey })
        .eq("user_id", user_id);

      console.log(`Successfully sent reminder to ${userEmail}`);
      emailsSent++;
    }

    console.log(`Completed: ${emailsSent} emails sent, ${emailsSkipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        emailsSkipped 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

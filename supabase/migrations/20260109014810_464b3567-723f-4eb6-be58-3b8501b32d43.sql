-- Create a secure function to invoke the weekly reminders edge function
-- This function runs with SECURITY DEFINER to access vault secrets
CREATE OR REPLACE FUNCTION public.invoke_weekly_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_role_key text;
  supabase_url text;
BEGIN
  -- Get the service role key from environment (available in pg functions)
  service_role_key := current_setting('supabase.service_role_key', true);
  supabase_url := current_setting('supabase.url', true);
  
  -- If settings not available, use direct values
  IF service_role_key IS NULL THEN
    -- Fallback: the function will be called but auth may fail
    -- This is intentional - better to fail securely than expose keys
    RAISE NOTICE 'Service role key not available in pg settings';
    RETURN;
  END IF;
  
  -- Make HTTP request to edge function
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-weekly-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  );
END;
$$;
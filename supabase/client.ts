
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your project's URL and Anon Key
// A placeholder URL is used below to prevent the app from crashing.
// You MUST replace these with your actual Supabase credentials for the app to work.
const supabaseUrl = 'https://gibxtzsscptxodmuoptv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYnh0enNzY3B0eG9kbXVvcHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjYxMjgsImV4cCI6MjA4MjA0MjEyOH0.WxYI7AL5E2_lJkgPvs6FQS6Ky0xSUzRsWtM-wu_PCgs';

export const isConfigured = supabaseUrl !== 'https://example.supabase.co' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY' && supabaseUrl && supabaseKey;

// Log an error to the console if the configuration is missing.
if (!isConfigured) {
  console.error(
    'Supabase is not configured! Please open supabase/client.ts and add your Supabase URL and anon key.'
  );
}

// Create the client only once.
export const supabase = createClient(supabaseUrl, supabaseKey);
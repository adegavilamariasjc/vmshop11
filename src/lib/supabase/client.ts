
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Supabase credentials
const supabaseUrl = "https://zdtuvslyqayjedjsfvwa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdHV2c2x5cWF5amVkanNmdndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzU1NjIsImV4cCI6MjA1OTQxMTU2Mn0.vBugMM69TLwKbWwlPpEfTEER7Rjh2emQS44dlAEfByM";

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

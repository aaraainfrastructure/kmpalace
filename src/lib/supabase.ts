import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://htlgfpfmjuneswmqpxfw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bGdmcGZtanVuZXN3bXFweGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTkwNDEsImV4cCI6MjEwMDM3NTA0MX0.tAlhRaaIQuYhLvqsiON6rMFtafmCCu7PU6fwk9bazXg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

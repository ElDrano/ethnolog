import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjhacxerhcncrcszjaiu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaGFjeGVyaGNuY3Jjc3pqYWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3NjQsImV4cCI6MjA2NjI3OTc2NH0.cpHPB3QPB5wlQkF2oRd6Fb0CpsJt3sdnCuflTkpA2-M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
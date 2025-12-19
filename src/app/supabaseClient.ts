import { createClient } from '@supabase/supabase-js';

// Fallback-Werte für den Fall, dass Umgebungsvariablen nicht gesetzt sind
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjhacxerhcncrcszjaiu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaGFjeGVyaGNuY3Jjc3pqYWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3NjQsImV4cCI6MjA2NjI3OTc2NH0.cpHPB3QPB5wlQkF2oRd6Fb0CpsJt3sdnCuflTkpA2-M';

// Warnung nur im Client (nicht beim Server-Side Rendering)
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables not found. Using fallback values. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prüfe ob Umgebungsvariablen gesetzt sind (nur im Client, nicht beim Build)
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are missing!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }
}

// Verwende leere Strings als Fallback für den Build (verhindert Build-Fehler)
// In Production müssen die Umgebungsvariablen gesetzt sein
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
); 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

/**
 * Supabase client for frontend use (anon key).
 * Primary data operations go through the Express API.
 * This client is available for direct Supabase queries if needed.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

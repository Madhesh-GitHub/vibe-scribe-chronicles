
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

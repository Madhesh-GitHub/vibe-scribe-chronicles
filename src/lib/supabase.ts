
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvlotgemhepowjwstlys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2bG90Z2VtaGVwb3dqd3N0bHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzc5OTIsImV4cCI6MjA2NjYxMzk5Mn0.IHp1rDNk4OEZt7qUnx1-1AHJNIUGlTcSnEnzZg8n-ms';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

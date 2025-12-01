import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://zndrpbqlrnwzoggimdds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZHJwYnFscm53em9nZ2ltZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTQ3MzcsImV4cCI6MjA4MDE5MDczN30.F23zFM2hBG4fOJL8CR7lG-uzRnje1eoFgWYGdnuN0GA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
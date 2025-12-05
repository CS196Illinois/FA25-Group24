import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://esabjbknsgzojtvesnrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzYWJqYmtuc2d6b2p0dmVzbnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTQ1NDMsImV4cCI6MjA4MDQ5MDU0M30.Mcw_0Ax5LHsgpCj3ujfb5JnB3hp-piWe6IlogxmR_fc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
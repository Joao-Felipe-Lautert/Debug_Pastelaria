import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Substitua pelas suas chaves do Supabase
const SUPABASE_URL = 'https://kmvvnlhvtcoedmwmoruz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdnZubGh2dGNvZWRtd21vcnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDc2MjUsImV4cCI6MjA4OTYyMzYyNX0.Mo6T-58N5KjjDBQyLquuwwtdvYmLZQGZ1MUFJEcJZa8';

// No web, usamos o localStorage nativo do browser.
// No mobile (iOS/Android), usamos AsyncStorage do React Native.
// Isso evita o erro "window is not defined" durante o SSR/static rendering.
const getStorage = () => {
  if (Platform.OS === 'web') {
    // No ambiente web, usar localStorage nativo
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  }
  // No mobile, importar AsyncStorage dinamicamente
  return require('@react-native-async-storage/async-storage').default;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

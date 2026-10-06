import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

/** False until real values replace the placeholders in .env. */
export const isSupabaseConfigured =
  /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(url) &&
  !url.includes('YOUR-PROJECT-REF') &&
  key.length > 20 &&
  !key.startsWith('paste-');

export const supabase = createClient(isSupabaseConfigured ? url : 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: {
    // Session (access + refresh token) lives in expo-sqlite's localStorage: users stay signed in across launches.
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Mobile has no page URL; deep links are handled by src/app/auth-callback.tsx instead.
    detectSessionInUrl: false,
    // PKCE: OAuth (Google), email confirmation and password-reset links come back with a one-time code.
    flowType: 'pkce',
  },
});

// Refresh tokens only while the app is in the foreground (Supabase's recommendation for mobile).
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export const AVATAR_BUCKET = 'avatars';

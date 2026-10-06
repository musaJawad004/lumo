import { File } from 'expo-file-system';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { AVATAR_BUCKET, supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

// ───────────── auth ─────────────

/** Where Supabase sends users back to the app: lumo://auth-callback (see src/app/auth-callback.tsx). */
export function authRedirectUrl(params?: Record<string, string>) {
  return Linking.createURL('auth-callback', { queryParams: params });
}

const exchangedCodes = new Set<string>();

/**
 * Finishes any redirect-based auth (Google, email confirmation, password reset):
 * reads the one-time `code` from the URL and trades it for a session. Safe to call twice.
 */
export async function completeAuthFromUrl(url: string) {
  const { queryParams } = Linking.parse(url);
  const description = queryParams?.error_description ?? queryParams?.error;
  if (description) throw new Error(String(description));
  const code = queryParams?.code;
  if (typeof code !== 'string') return;
  if (exchangedCodes.has(code)) return;
  exchangedCodes.add(code);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

/** Google via Supabase OAuth in a secure in-app browser. Resolves false if the user cancels. */
export async function signInWithGoogle(): Promise<boolean> {
  const redirectTo = authRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  await completeAuthFromUrl(result.url);
  return true;
}

export async function signUp(name: string, email: string, password: string, language = 'en') {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    // `language` lets the database name the starter habits in the user's language.
    options: { data: { display_name: name.trim(), language }, emailRedirectTo: authRedirectUrl() },
  });
  if (error) throw error;
  /** No session = the project requires email confirmation first. */
  return { needsConfirmation: !data.session };
}

/** Sends the sign-up confirmation email again. */
export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) throw error;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut({ scope: 'local' });
}

/** Revokes every session of this user (all phones), then signs out here. */
export async function signOutEverywhere() {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) await supabase.auth.signOut({ scope: 'local' });
}

/** The email link opens Lumo at auth-callback?type=recovery, which signs in and shows "Change password". */
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: authRedirectUrl({ type: 'recovery' }),
  });
  if (error) throw error;
}

/**
 * Finishes a reset with the code from the email (works even if the email is opened on another device):
 * verifies the code (signs the user in), then sets the new password.
 */
export async function resetPasswordWithCode(email: string, code: string, password: string) {
  const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
  if (error) throw error;
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) throw updateError;
}

export async function changePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** Removes the avatar files, then the account (all habits and logs cascade). */
export async function deleteAccount(userId: string) {
  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  if (files?.length) await supabase.storage.from(AVATAR_BUCKET).remove(files.map((f) => `${userId}/${f.name}`));
  const { error } = await supabase.rpc('delete_account');
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
}

// ───────────── profile ─────────────

/** Profile plus the raw synced-settings columns (applied by services/settingsSync.ts). */
export async function fetchProfile(userId: string, email: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  const row = data as ProfileRow;
  const profile: Profile = { id: row.id, email, displayName: row.display_name, avatarUrl: row.avatar_url };
  return { profile, settings: { language: row.language, theme: row.theme, preferences: row.preferences ?? {} } };
}

export async function saveSettings(
  userId: string,
  settings: { language: string; theme: string; preferences: Record<string, unknown> },
) {
  const { error } = await supabase.from('profiles').update(settings).eq('id', userId);
  if (error) throw error;
}

export async function updateProfile(userId: string, patch: { displayName?: string; avatarUrl?: string | null }) {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(patch.displayName !== undefined && { display_name: patch.displayName.trim() }),
      ...(patch.avatarUrl !== undefined && { avatar_url: patch.avatarUrl }),
    })
    .eq('id', userId);
  if (error) throw error;
}

/** Uploads a picked image to avatars/<userId>/ and returns its public URL. */
export async function uploadAvatar(userId: string, localUri: string, mimeType = 'image/jpeg'): Promise<string> {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const bytes = await new File(localUri).bytes();

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, bytes, { contentType: mimeType });
  if (error) throw error;

  // Keep only the newest avatar.
  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  const stale = (files ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== path);
  if (stale.length) await supabase.storage.from(AVATAR_BUCKET).remove(stale);

  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

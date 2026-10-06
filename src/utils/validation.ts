import type { TranslationKey } from '@/i18n/locales/en';

export const MIN_PASSWORD = 8;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isStrongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD;
}

/** Supabase auth error codes we explain in the user's language. */
const AUTH_ERRORS: Record<string, TranslationKey> = {
  email_address_invalid: 'auth.errEmailInvalid',
  email_address_not_authorized: 'auth.errEmailInvalid',
  over_email_send_rate_limit: 'auth.errRateLimit',
  over_request_rate_limit: 'auth.errRateLimit',
  user_already_exists: 'auth.errUserExists',
  email_exists: 'auth.errUserExists',
  invalid_credentials: 'auth.errInvalidCredentials',
  email_not_confirmed: 'auth.errNotConfirmed',
  weak_password: 'auth.errWeakPassword',
  otp_expired: 'auth.errOtp',
  otp_disabled: 'auth.errOtp',
};

export function authErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') return error.code;
  return undefined;
}

/**
 * Best user-facing message for an auth error: a translated explanation for known codes,
 * otherwise Supabase's own message, otherwise null (caller shows the generic copy).
 */
export function describeAuthError(error: unknown, t: (key: TranslationKey) => string): string | null {
  const code = authErrorCode(error);
  if (code && AUTH_ERRORS[code]) return t(AUTH_ERRORS[code]);
  return authErrorMessage(error);
}

/** Supabase's raw error message, or null for unknown errors. */
export function authErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return null;
}

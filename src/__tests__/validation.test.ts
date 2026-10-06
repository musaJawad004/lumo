import { describeAuthError, isEmail, isStrongEnough } from '@/utils/validation';

describe('validation', () => {
  it('accepts real-looking emails and rejects broken ones', () => {
    expect(isEmail('musa@gmail.com')).toBe(true);
    expect(isEmail(' a.b+lumo@company.co.uk ')).toBe(true);
    for (const bad of ['', 'musa', 'musa@', '@gmail.com', 'musa@gmail', 'mu sa@gmail.com']) expect(isEmail(bad)).toBe(false);
  });

  it('requires at least 8 characters', () => {
    expect(isStrongEnough('1234567')).toBe(false);
    expect(isStrongEnough('12345678')).toBe(true);
  });

  it('maps Supabase error codes to translated messages', () => {
    const t = (key: string) => `t:${key}`;
    expect(describeAuthError({ code: 'over_email_send_rate_limit', message: 'x' }, t)).toBe('t:auth.errRateLimit');
    expect(describeAuthError({ code: 'invalid_credentials', message: 'x' }, t)).toBe('t:auth.errInvalidCredentials');
    expect(describeAuthError({ code: 'something_new', message: 'Raw message' }, t)).toBe('Raw message');
    expect(describeAuthError('boom', t)).toBeNull();
  });
});

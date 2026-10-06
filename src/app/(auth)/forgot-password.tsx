import { useState } from 'react';
import { Alert } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button, Field } from '@/components/ui';
import { Notice } from '@/components/ui/Notice';
import { icons } from '@/constants/icons';
import { useCooldown } from '@/hooks/useCooldown';
import { useT } from '@/i18n';
import { resetPasswordWithCode, sendPasswordReset } from '@/services/api/account';
import { describeAuthError, isEmail, isStrongEnough } from '@/utils/validation';

type Step = 'email' | 'code';

/**
 * Two steps: send the reset email → enter the code from it plus a new password.
 * The email's link also works when tapped on this phone (handled by /auth-callback).
 */
export default function ForgotPasswordScreen() {
  const t = useT();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; code?: string; password?: string; confirm?: string; form?: string }>({});
  const [notice, setNotice] = useState<string>();
  const [loading, setLoading] = useState(false);
  const cooldown = useCooldown(60);

  const send = async () => {
    if (!isEmail(email)) return setErrors({ email: t('auth.errEmail') });
    setErrors({});
    setNotice(undefined);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      cooldown.start();
      if (step === 'code') setNotice(t('auth.resent'));
      setStep('code');
    } catch (error) {
      setErrors({ form: describeAuthError(error, t) ?? t('auth.errGeneric') });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const next = {
      code: code.trim().length >= 6 ? undefined : t('auth.errCode'),
      password: isStrongEnough(password) ? undefined : t('auth.errPassword'),
      confirm: password === confirm ? undefined : t('account.errMismatch'),
    };
    setErrors(next);
    if (next.code || next.password || next.confirm) return;
    setLoading(true);
    try {
      await resetPasswordWithCode(email, code, password);
      // Signed in now: the auth guard switches to Home.
      Alert.alert(t('account.passwordChanged'), t('auth.passwordReset'));
    } catch (error) {
      setErrors({ form: describeAuthError(error, t) ?? t('auth.errGeneric') });
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthScreen title={t('auth.codeTitle')} body={t('auth.codeBody', { email: email.trim() })}>
        <Field
          label={t('auth.code')}
          placeholder="123456"
          icon={icons.lock}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
          error={errors.code}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={8}
        />
        <Field
          label={t('account.newPassword')}
          placeholder={t('auth.passwordHint')}
          icon={icons.lock}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          textContentType="newPassword"
        />
        <Field
          label={t('account.confirmPassword')}
          placeholder="••••••••"
          icon={icons.lock}
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
          textContentType="newPassword"
          onSubmitEditing={reset}
        />
        {errors.form && <Notice tone="error" message={errors.form} />}
        {notice && !errors.form && <Notice tone="success" message={notice} />}
        <Button label={t('auth.setPassword')} fullWidth loading={loading} onPress={reset} />
        <Button
          label={cooldown.left > 0 ? t('auth.resendIn', { seconds: cooldown.left }) : t('auth.resend')}
          variant="soft"
          fullWidth
          disabled={cooldown.left > 0 || loading}
          onPress={send}
        />
        <Button
          label={t('auth.useDifferentEmail')}
          variant="ghost"
          fullWidth
          onPress={() => {
            setStep('email');
            setCode('');
            setErrors({});
            setNotice(undefined);
          }}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t('auth.resetTitle')} body={t('auth.resetBody')}>
      <Field
        label={t('auth.email')}
        placeholder="you@example.com"
        icon={icons.envelope}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        autoComplete="email"
        onSubmitEditing={send}
      />
      {errors.form && <Notice tone="error" message={errors.form} />}
      <Button label={t('auth.sendLink')} fullWidth loading={loading} onPress={send} />
    </AuthScreen>
  );
}

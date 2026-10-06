import { router } from 'expo-router';
import { useState } from 'react';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { GoogleButton, OrDivider } from '@/components/auth/GoogleButton';
import { ResendEmail } from '@/components/auth/ResendEmail';
import { Button, EmptyState, Field } from '@/components/ui';
import { Notice } from '@/components/ui/Notice';
import { icons } from '@/constants/icons';
import { useLanguage, useT } from '@/i18n';
import { signUp } from '@/services/api/account';
import { describeAuthError, isEmail, isStrongEnough } from '@/utils/validation';

export default function SignUpScreen() {
  const t = useT();
  const language = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async () => {
    const next = {
      name: name.trim() ? undefined : t('auth.errName'),
      email: isEmail(email) ? undefined : t('auth.errEmail'),
      password: isStrongEnough(password) ? undefined : t('auth.errPassword'),
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;

    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(name, email, password, language.code);
      // With confirmation off, Supabase signs the user in and the auth guard moves on to Home.
      if (needsConfirmation) setSentTo(email.trim());
    } catch (error) {
      setErrors({ form: describeAuthError(error, t) ?? t('auth.errGeneric') });
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthScreen title={t('auth.checkEmailTitle')}>
        <EmptyState
          icon={icons.envelope}
          title={sentTo}
          body={t('auth.checkEmailBody', { email: sentTo })}
        />
        <ResendEmail email={sentTo} startCooling />
        <Button label={t('auth.signIn')} fullWidth onPress={() => router.replace('/sign-in')} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('auth.signUpTitle')}
      body={t('auth.signUpBody')}
      footer={<Button label={t('auth.haveAccountShort')} variant="ghost" onPress={() => router.replace('/sign-in')} />}
    >
      <GoogleButton />
      <OrDivider />
      <Field
        label={t('auth.name')}
        placeholder={t('auth.namePlaceholder')}
        icon={icons.user}
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
        maxLength={40}
      />
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
      />
      <Field
        label={t('auth.password')}
        placeholder={t('auth.passwordHint')}
        icon={icons.lock}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="new-password"
        onSubmitEditing={submit}
      />
      {errors.form && <Notice tone="error" message={errors.form} />}
      <Button label={t('auth.createAccount')} fullWidth loading={loading} onPress={submit} />
    </AuthScreen>
  );
}

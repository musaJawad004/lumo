import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { GoogleButton, OrDivider } from '@/components/auth/GoogleButton';
import { ResendEmail } from '@/components/auth/ResendEmail';
import { Button, Field } from '@/components/ui';
import { Notice } from '@/components/ui/Notice';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { signIn } from '@/services/api/account';
import { makeStyles } from '@/theme';
import { authErrorCode, describeAuthError, isEmail } from '@/utils/validation';

export default function SignInScreen() {
  const t = useT();
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; form?: string; unconfirmed?: boolean }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isEmail(email)) return setErrors({ email: t('auth.errEmail') });
    setErrors({});
    setLoading(true);
    try {
      await signIn(email, password);
      // The auth guard in the root layout switches to the app.
    } catch (error) {
      setErrors({
        form: describeAuthError(error, t) ?? t('auth.errGeneric'),
        unconfirmed: authErrorCode(error) === 'email_not_confirmed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={t('auth.signInTitle')}
      body={t('auth.signInBody')}
      footer={<Button label={t('auth.noAccount')} variant="ghost" onPress={() => router.replace('/sign-up')} />}
    >
      <GoogleButton />
      <OrDivider />
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
      <View>
        <Field
          label={t('auth.password')}
          placeholder="••••••••"
          icon={icons.lock}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          autoComplete="current-password"
          onSubmitEditing={submit}
        />
        <Button
          label={t('auth.forgot')}
          variant="ghost"
          size="sm"
          style={styles.forgot}
          onPress={() => router.push('/forgot-password')}
        />
      </View>
      {errors.form && <Notice tone="error" message={errors.form} />}
      {errors.unconfirmed && <ResendEmail email={email} />}
      <Button label={t('auth.signIn')} fullWidth loading={loading} onPress={submit} />
    </AuthScreen>
  );
}

const useStyles = makeStyles(() => ({
  forgot: { alignSelf: 'flex-end', marginTop: 4 },
}));

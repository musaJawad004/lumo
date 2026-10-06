import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button, Field, IconButton, Text } from '@/components/ui';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { changePassword } from '@/services/api/account';
import { makeStyles } from '@/theme';
import { describeAuthError, isStrongEnough } from '@/utils/validation';

export default function ChangePasswordScreen() {
  const t = useT();
  const styles = useStyles();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = {
      password: isStrongEnough(password) ? undefined : t('auth.errPassword'),
      confirm: password === confirm ? undefined : t('account.errMismatch'),
    };
    setError(next);
    if (next.password || next.confirm) return;
    setLoading(true);
    try {
      await changePassword(password);
      Alert.alert(t('account.passwordChanged'), undefined, [{ text: t('common.ok'), onPress: () => router.back() }]);
    } catch (e) {
      setError({ password: describeAuthError(e, t) ?? t('auth.errGeneric') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <FadeIn style={styles.header}>
        <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
        <Text variant="h1">{t('account.changePassword')}</Text>
      </FadeIn>
      <FadeIn index={1}>
        <GlassCard radius={24}>
          <View style={styles.form}>
            <Field
              label={t('account.newPassword')}
              placeholder={t('auth.passwordHint')}
              icon={icons.lock}
              value={password}
              onChangeText={setPassword}
              error={error.password}
              secureTextEntry
              textContentType="newPassword"
            />
            <Field
              label={t('account.confirmPassword')}
              placeholder="••••••••"
              icon={icons.lock}
              value={confirm}
              onChangeText={setConfirm}
              error={error.confirm}
              secureTextEntry
              textContentType="newPassword"
              onSubmitEditing={submit}
            />
            <Button label={t('common.save')} fullWidth loading={loading} onPress={submit} />
          </View>
        </GlassCard>
      </FadeIn>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, marginBottom: t.space.xl },
  form: { gap: t.space.lg },
}));

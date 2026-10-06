import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { Button, EmptyState } from '@/components/ui';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { authRedirectUrl, completeAuthFromUrl } from '@/services/api/account';
import { makeStyles, useTheme } from '@/theme';

/**
 * Landing route for lumo://auth-callback links (Google on Android, email confirmation, password reset).
 * Trades the one-time code for a session; the auth guard then shows the app.
 */
export default function AuthCallbackScreen() {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ code?: string; type?: string; error_description?: string }>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const query: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) if (typeof v === 'string') query[k] = v;
    // Opened without a code (e.g. a stale link): nothing to finish, just go home.
    if (!query.code && !query.error_description) {
      router.replace('/');
      return;
    }

    completeAuthFromUrl(authRedirectUrl(query))
      .then(() => router.replace(params.type === 'recovery' ? '/password' : '/'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t('auth.errGeneric')));
  }, [params, t]);

  return (
    <Screen scroll={false} contentStyle={styles.center}>
      {error ? (
        <GlassCard radius={28}>
          <EmptyState
            icon={icons.lock}
            title={t('common.error')}
            body={error}
            action={<Button label={t('auth.signIn')} onPress={() => router.replace('/')} />}
          />
        </GlassCard>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  center: { justifyContent: 'center' },
}));

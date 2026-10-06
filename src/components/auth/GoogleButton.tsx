import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { signInWithGoogle } from '@/services/api/account';
import { makeStyles, useTheme } from '@/theme';
import { describeAuthError } from '@/utils/validation';

/** Google's multicolor "G" (brand guideline asset, unmodified). */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

/** "Continue with Google": opens Google in a secure in-app browser via Supabase. */
export function GoogleButton() {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // On success the auth listener signs the user in and the guard shows Home.
    } catch (error) {
      Alert.alert(t('common.error'), describeAuthError(error, t) ?? t('auth.errGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityLabel={t('auth.continueGoogle')}
      accessibilityState={{ busy: loading }}
      style={styles.button}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <GoogleLogo />}
      <Text variant="bodyStrong" color="text">
        {t('auth.continueGoogle')}
      </Text>
    </Pressable>
  );
}

/** "──── or ────" separator between Google and email. */
export function OrDivider() {
  const t = useT();
  const styles = useStyles();
  return (
    <View style={styles.divider} accessibilityElementsHidden>
      <View style={styles.line} />
      <Text variant="caption">{t('auth.or')}</Text>
      <View style={styles.line} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.md,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    ...t.shadow.card,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  line: { flex: 1, height: 1, backgroundColor: t.colors.border },
}));

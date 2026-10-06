import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { icons } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

interface Props {
  tone: 'error' | 'success';
  message: string;
  /** Optional action under the message (e.g. "Resend email"). */
  action?: ReactNode;
}

/** Inline banner for form-level errors and confirmations. Announced to screen readers. */
export function Notice({ tone, message, action }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const error = tone === 'error';
  const IconCmp = error ? icons.info : icons.checkCircle;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.root, error ? styles.error : styles.success]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        <IconCmp size={18} color={error ? colors.danger : colors.success} weight="fill" />
        <Text variant="body" color={error ? 'danger' : 'success'} style={styles.text}>
          {message}
        </Text>
      </View>
      {action}
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { borderRadius: t.radius.input, padding: t.space.md, gap: t.space.sm, borderWidth: 1 },
  error: { backgroundColor: t.isDark ? 'rgba(255,59,48,0.12)' : '#FFF1F0', borderColor: t.isDark ? 'rgba(255,59,48,0.35)' : '#FFD2CE' },
  success: { backgroundColor: t.colors.successSoft, borderColor: t.colors.successLine },
  row: { flexDirection: 'row', gap: t.space.sm, alignItems: 'flex-start' },
  text: { flex: 1 },
}));

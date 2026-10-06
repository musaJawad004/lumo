import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { FadeIn } from '@/components/motion/FadeIn';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { makeStyles } from '@/theme';

interface Props {
  title: string;
  body?: string;
  children: ReactNode;
  /** Pinned to the bottom of the screen, e.g. "New to Lumo? Create an account". */
  footer?: ReactNode;
  showBack?: boolean;
}

/**
 * Shared frame for the auth screens. Open layout, no card: a large left-aligned
 * heading with its subtitle, the form directly on the background, and the footer link at the bottom.
 */
export function AuthScreen({ title, body, children, footer, showBack = true }: Props) {
  const t = useT();
  const styles = useStyles();
  const canGoBack = showBack && router.canGoBack();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
        <View style={styles.topBar}>
          {canGoBack && (
            <FadeIn>
              <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
            </FadeIn>
          )}
        </View>

        {/* Uneven spacers (top < bottom) keep the form a little above center. */}
        <View style={styles.spacerTop} />

        <FadeIn index={1} style={styles.head}>
          <Text variant="display" style={styles.title}>
            {title}
          </Text>
          {body && (
            <Text variant="body" style={styles.body}>
              {body}
            </Text>
          )}
        </FadeIn>

        <FadeIn index={2} style={styles.form}>
          {children}
        </FadeIn>

        <View style={styles.spacerBottom} />

        {footer && (
          <FadeIn index={3} style={styles.footer}>
            <View style={styles.footerLink}>{footer}</View>
          </FadeIn>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  // Fills the screen so the footer can sit at the bottom; still scrolls when the keyboard is up.
  content: { flexGrow: 1, paddingTop: t.space.sm, paddingBottom: t.space.md },
  topBar: { height: 48, justifyContent: 'center' },
  spacerTop: { flexGrow: 1, minHeight: t.space.lg },
  spacerBottom: { flexGrow: 1.5, minHeight: t.space.xxl },
  head: { gap: t.space.sm, marginBottom: t.space.xxl },
  title: { fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  body: { fontSize: 16, lineHeight: 22, maxWidth: 320 },
  form: { gap: t.space.lg },
  footer: { alignItems: 'center' },
  footerLink: { alignSelf: 'center' },
}));

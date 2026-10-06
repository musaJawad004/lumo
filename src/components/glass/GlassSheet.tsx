import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, ReduceMotion, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme';

import { GlassView } from './GlassView';

interface Props {
  title?: string;
  children: ReactNode;
  onClose: () => void;
  /** Pinned under the scrollable content, e.g. the primary "Create" button. */
  footer?: ReactNode;
}

/**
 * Frosted bottom sheet over a dimmed backdrop. Use it as the whole screen of a route presented
 * with `presentation: 'transparentModal'` (see src/app/_layout.tsx). Tapping the backdrop closes it.
 */
export function GlassSheet({ title, children, onClose, footer }: Props) {
  const { isDark } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Stronger fill than bars: sheets hold forms and must stay readable.
  const sheetFill = isDark ? 'rgba(22,24,28,0.82)' : 'rgba(255,255,255,0.8)';

  const slideIn = SlideInDown.duration(380).easing(Easing.out(Easing.cubic)).reduceMotion(ReduceMotion.System);
  const slideOut = SlideOutDown.duration(240).reduceMotion(ReduceMotion.System);

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill}>
        <RNPressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View entering={slideIn} exiting={slideOut}>
          <GlassView intensity={60} fill={sheetFill} style={[styles.sheet, { paddingBottom: insets.bottom + 12, maxHeight: height * 0.9 }]}>
            <View style={styles.grab} />
            {title && (
              <Text variant="h2" align="center" style={styles.title} accessibilityRole="header">
                {title}
              </Text>
            )}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
            {footer && <View style={styles.footer}>{footer}</View>}
          </GlassView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: t.colors.overlay },
  sheet: {
    borderTopLeftRadius: t.radius.sheet,
    borderTopRightRadius: t.radius.sheet,
    paddingTop: t.space.md,
    paddingHorizontal: t.space.xl,
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: t.colors.iconMuted,
    opacity: 0.5,
    marginBottom: t.space.lg,
  },
  title: { marginBottom: t.space.lg },
  scroll: { flexGrow: 0 },
  content: { gap: t.space.lg, paddingBottom: t.space.lg },
  footer: { paddingTop: t.space.sm },
}));

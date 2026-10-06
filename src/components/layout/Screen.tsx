import { useIsFocused } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/glass/AmbientBackground';
import { makeStyles, useTheme } from '@/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  /** Enables pull-to-refresh (scrolling screens only). */
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** Base for every screen: theme background, safe area, 16pt side padding, optional scroll. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top'],
  contentStyle,
  onRefresh,
  refreshing = false,
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(1);

  // Every time the screen comes into focus (e.g. switching tabs), its content rises gently into place.
  useEffect(() => {
    if (!focused || reduceMotion) return;
    enter.set(0);
    enter.set(withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
  }, [focused, reduceMotion, enter]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * enter.value,
    transform: [{ translateY: 14 * (1 - enter.value) }],
  }));
  const inner = [padded && styles.padded, contentStyle];

  return (
    <SafeAreaView edges={edges} style={styles.root}>
      <AmbientBackground />
      <Animated.View style={[styles.fill, enterStyle]}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, inner]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, inner]}>{children}</View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.screen },
  fill: { flex: 1 },
  padded: { paddingHorizontal: t.layout.screenPadding },
  // Room to scroll the last item clear of the tab bar.
  scrollContent: { paddingTop: t.space.sm, paddingBottom: 110 },
}));

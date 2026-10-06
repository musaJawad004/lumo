import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotConfigured } from '@/components/auth/NotConfigured';
import { AnimatedSplash } from '@/components/motion/AnimatedSplash';
import { ThemeFade } from '@/components/motion/ThemeFade';
import { useAuthListener } from '@/hooks/useAuthListener';
import { useDailyReminderSync } from '@/hooks/useDailyReminderSync';
import { resolveLanguage } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';
import { applyDirection } from '@/services/direction';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 150, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold });
  const ready = fontsLoaded || fontError != null;

  // The native splash (background only) stays until fonts are ready, then AnimatedSplash takes over.
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Root() {
  const { isDark } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const authStatus = useAuthStore((s) => s.status);
  const hideNativeSplash = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  useAuthListener();
  useDailyReminderSync();

  // First launch on an Arabic/Urdu phone (or after a reset): match the layout direction to the language.
  useEffect(() => {
    applyDirection(resolveLanguage(useSettingsStore.getState().language).rtl);
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Wait for the stored session before choosing auth vs app routes (the splash covers this). */}
      {!isSupabaseConfigured ? (
        <NotConfigured />
      ) : (
        authStatus !== 'loading' && <RootStack signedIn={authStatus === 'signedIn'} />
      )}
      <ThemeFade />
      {!splashDone && <AnimatedSplash onReady={hideNativeSplash} onFinish={finishSplash} />}
    </>
  );
}

const sheet = {
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' },
} as const;

function RootStack({ signedIn }: { signedIn: boolean }) {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.screen } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="habit/new" options={sheet} />
        <Stack.Screen name="habit/[id]/index" options={{ animation: 'default' }} />
        <Stack.Screen name="habit/[id]/edit" options={sheet} />
        <Stack.Screen name="profile" options={{ animation: 'default' }} />
        <Stack.Screen name="password" options={{ animation: 'default' }} />
        <Stack.Screen name="language" options={{ animation: 'default' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" options={{ animation: 'default' }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ animation: 'default' }} />
      </Stack.Protected>
      {/* Deep-link landing for Google / email confirmation / password reset: reachable signed in or out.
          Kept last: when a guard redirects, Expo Router picks the first allowed screen. */}
      <Stack.Screen name="auth-callback" />
    </Stack>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

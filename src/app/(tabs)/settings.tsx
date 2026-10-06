import { router } from 'expo-router';
import { Alert, I18nManager, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { ProfileSkeleton } from '@/components/layout/Skeletons';
import { FadeIn } from '@/components/motion/FadeIn';
import { AboutFooter } from '@/components/settings/AboutFooter';
import { ReminderCard } from '@/components/settings/ReminderCard';
import { Avatar, ListGroup, ListRow, Pressable, Segmented, Switch, Text, type SegmentOption } from '@/components/ui';
import { icons } from '@/constants/icons';
import { useRefresh } from '@/hooks/useRefresh';
import { resolveLanguage, useLanguage, useT } from '@/i18n';
import { deleteAccount, signOut, signOutEverywhere } from '@/services/api/account';
import { applyDirection, needsDirectionChange } from '@/services/direction';
import { useAuthStore } from '@/store/authStore';
import { useOutboxStore } from '@/store/outboxStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme';
import type { ThemePreference } from '@/types/settings';
import { describeAuthError } from '@/utils/validation';

export default function SettingsScreen() {
  const t = useT();
  const language = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles();
  const settings = useSettingsStore();
  const profile = useProfileStore((s) => s.profile);
  const userId = useAuthStore((s) => s.userId);
  const pending = useOutboxStore((s) => s.ops.length);
  const { refreshing, onRefresh, showSkeleton } = useRefresh(profile !== null);

  const themeOptions: SegmentOption<ThemePreference>[] = [
    { value: 'system', label: t('settings.themeSystem'), icon: icons.deviceMobile },
    { value: 'light', label: t('settings.themeLight'), icon: icons.sun },
    { value: 'dark', label: t('settings.themeDark'), icon: icons.moon },
  ];

  const confirmSignOut = () =>
    Alert.alert(t('account.signOutConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);

  const confirmSignOutAll = () =>
    Alert.alert(t('account.signOutAllTitle'), t('account.signOutAllBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.signOut'), style: 'destructive', onPress: () => signOutEverywhere() },
    ]);

  const confirmDelete = () =>
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.deleteAction'),
        style: 'destructive',
        onPress: () =>
          userId &&
          deleteAccount(userId).catch((e) => Alert.alert(t('common.error'), describeAuthError(e, t) ?? t('auth.errGeneric'))),
      },
    ]);

  const confirmReset = () =>
    Alert.alert(t('settings.resetTitle'), t('settings.resetBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.resetAction'),
        style: 'destructive',
        onPress: () => {
          settings.reset();
          const { rtl } = resolveLanguage('system');
          if (needsDirectionChange(rtl)) applyDirection(rtl);
        },
      },
    ]);

  const name = profile?.displayName.trim() || 'Lumo';
  let i = 0;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn index={i++}>
        <Text variant="h1">{t('settings.title')}</Text>
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        {showSkeleton ? (
          <ProfileSkeleton />
        ) : (
          <Pressable onPress={() => router.push('/profile')} scaleTo={0.98} accessibilityLabel={t('account.editProfile')}>
            <GlassCard radius={24}>
              <View style={styles.profile}>
                <Avatar name={name} uri={profile?.avatarUrl ?? undefined} size={60} variant="brand" />
                <View style={styles.flex}>
                  <Text variant="h2" numberOfLines={1}>
                    {name}
                  </Text>
                  <Text variant="body" numberOfLines={1}>
                    {profile?.email}
                  </Text>
                  <View style={styles.sync}>
                    <View style={[styles.syncDot, { backgroundColor: pending ? colors.streak : colors.success }]} />
                    <Text variant="caption">
                      {pending ? t('settings.pendingSync', { count: pending }) : t('settings.synced')}
                    </Text>
                  </View>
                </View>
                <icons.caretRight size={18} color={colors.iconMuted} weight="bold" mirrored={I18nManager.isRTL} />
              </View>
            </GlassCard>
          </Pressable>
        )}
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        <Text variant="overline" style={styles.label}>
          {t('settings.appearance')}
        </Text>
        <Segmented options={themeOptions} value={settings.theme} onChange={settings.setTheme} />
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        <ListGroup title={t('settings.preferences')}>
          <ListRow
            icon={icons.translate}
            iconColor={colors.primary}
            title={t('settings.language')}
            value={settings.language === 'system' ? t('settings.deviceLanguage') : language.nativeName}
            onPress={() => router.push('/language')}
          />
          <ListRow
            icon={icons.vibrate}
            iconColor={colors.streak}
            title={t('settings.haptics')}
            subtitle={t('settings.hapticsSub')}
            right={<Switch value={settings.haptics} onValueChange={settings.setHaptics} accessibilityLabel={t('settings.haptics')} />}
          />
          <ListRow
            icon={icons.listChecks}
            iconColor={colors.success}
            title={t('settings.hideCompleted')}
            subtitle={t('settings.hideCompletedSub')}
            right={
              <Switch
                value={settings.hideCompleted}
                onValueChange={(on) => settings.set('hideCompleted', on)}
                accessibilityLabel={t('settings.hideCompleted')}
              />
            }
          />
        </ListGroup>
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        <ReminderCard />
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        <ListGroup title={t('settings.account')}>
          <ListRow icon={icons.user} iconColor={colors.primary} title={t('account.editProfile')} onPress={() => router.push('/profile')} />
          <ListRow icon={icons.lock} iconColor={colors.textMuted} title={t('account.changePassword')} onPress={() => router.push('/password')} />
          <ListRow icon={icons.signOut} iconColor={colors.streak} title={t('account.signOut')} onPress={confirmSignOut} />
          <ListRow
            icon={icons.deviceMobileSlash}
            iconColor={colors.danger}
            title={t('account.signOutAll')}
            onPress={confirmSignOutAll}
          />
        </ListGroup>
      </FadeIn>

      <FadeIn index={i++} style={styles.section}>
        <ListGroup title={t('settings.data')}>
          <ListRow icon={icons.arrowCounterClockwise} iconColor={colors.textMuted} title={t('settings.reset')} onPress={confirmReset} />
          <ListRow icon={icons.trash} iconColor={colors.danger} title={t('account.delete')} destructive onPress={confirmDelete} />
        </ListGroup>
      </FadeIn>

      <FadeIn index={i++}>
        <AboutFooter />
      </FadeIn>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1, gap: 2 },
  section: { marginTop: t.layout.sectionGap },
  label: { marginBottom: t.space.sm, marginStart: t.space.xs },
  profile: { flexDirection: 'row', alignItems: 'center', gap: t.space.lg },
  sync: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  syncDot: { width: 7, height: 7, borderRadius: 4 },
}));

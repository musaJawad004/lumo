import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useT } from '@/i18n';
import { fonts, useTheme } from '@/theme';

/** Lumo's own Phosphor icons, pre-rendered as template images (outline = idle, filled = selected) so the
 *  native bar can tint them. Regenerate with the same names in assets/tabs/ to change an icon. */
const tabIcons = {
  home: { default: require('../../../assets/tabs/tab-home.png'), selected: require('../../../assets/tabs/tab-home-fill.png') },
  stats: { default: require('../../../assets/tabs/tab-stats.png'), selected: require('../../../assets/tabs/tab-stats-fill.png') },
  habits: { default: require('../../../assets/tabs/tab-habits.png'), selected: require('../../../assets/tabs/tab-habits-fill.png') },
  profile: {
    default: require('../../../assets/tabs/tab-profile.png'),
    selected: require('../../../assets/tabs/tab-profile-fill.png'),
  },
};

/**
 * Native tab bar.
 * - iOS 26+: the system draws it with Liquid Glass (its background comes from the content behind it).
 * - iOS 18 and Android: a standard bar on the plain surface color (white in light mode).
 * The selected tab is tinted blue; switching tabs uses the platform's own transition, no icon bounce.
 */
export default function TabsLayout() {
  const t = useT();
  const { colors } = useTheme();

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.iconMuted, selected: colors.primary }}
      backgroundColor={colors.surface}
      labelStyle={{ fontFamily: fonts.medium, fontSize: 11 }}
      minimizeBehavior="never"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon src={tabIcons.home} renderingMode="template" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Icon src={tabIcons.stats} renderingMode="template" />
        <NativeTabs.Trigger.Label>{t('tabs.stats')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="habits">
        <NativeTabs.Trigger.Icon src={tabIcons.habits} renderingMode="template" />
        <NativeTabs.Trigger.Label>{t('tabs.habits')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon src={tabIcons.profile} renderingMode="template" />
        <NativeTabs.Trigger.Label>{t('tabs.profile')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

import { Alert, Linking, View } from 'react-native';

import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { TimeChips } from '@/components/ui/TimeChips';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { ensureNotificationPermission } from '@/services/notifications';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme';

/** Notifications group: daily check-in (+ time) and the per-habit reminders master switch. */
export function ReminderCard() {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const s = useSettingsStore();

  const needsPermission = async (apply: () => void) => {
    if (await ensureNotificationPermission()) return apply();
    Alert.alert(t('settings.notifications'), t('settings.notificationsOff'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.openSettings'), onPress: () => Linking.openSettings() },
    ]);
  };

  return (
    <ListGroup title={t('settings.notifications')}>
      <ListRow
        icon={icons.bell}
        iconColor={colors.danger}
        title={t('settings.dailyReminder')}
        subtitle={t('settings.dailyReminderSub')}
        right={
          <Switch
            value={s.reminderEnabled}
            onValueChange={(on) => (on ? needsPermission(() => s.set('reminderEnabled', true)) : s.set('reminderEnabled', false))}
            accessibilityLabel={t('settings.dailyReminder')}
          />
        }
      />
      {s.reminderEnabled && (
        <View style={styles.times}>
          <Text variant="caption" style={styles.timesLabel}>
            {t('settings.reminderTime')}
          </Text>
          <TimeChips value={s.reminderTime} onChange={(time) => s.set('reminderTime', time)} contentStyle={styles.chips} />
        </View>
      )}
      <ListRow
        icon={icons.alarm}
        iconColor={colors.primary}
        title={t('settings.habitReminders')}
        subtitle={t('settings.habitRemindersSub')}
        right={
          <Switch
            value={s.habitReminders}
            onValueChange={(on) => (on ? needsPermission(() => s.set('habitReminders', true)) : s.set('habitReminders', false))}
            accessibilityLabel={t('settings.habitReminders')}
          />
        }
      />
    </ListGroup>
  );
}

const useStyles = makeStyles((t) => ({
  times: { paddingVertical: t.space.md, gap: t.space.sm },
  timesLabel: { marginStart: 44 },
  chips: { paddingStart: 44, paddingEnd: t.space.xs },
}));

import { useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Field } from '@/components/ui/Field';
import { Pressable } from '@/components/ui/Pressable';
import { Segmented, type SegmentOption } from '@/components/ui/Segmented';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { TimeChips } from '@/components/ui/TimeChips';
import { habitColors } from '@/constants/habitColors';
import { habitIcons, icons } from '@/constants/icons';
import { formatWeekday, useLanguage, useT } from '@/i18n';
import { ensureNotificationPermission } from '@/services/notifications';
import { makeStyles, useTheme } from '@/theme';
import type { HabitColor, HabitDraft, TimeOfDay } from '@/types/habit';
import { dayRange } from '@/utils/dates';
import { sortWeekdays } from '@/utils/schedule';

interface Props {
  draft: HabitDraft;
  onChange: (draft: HabitDraft) => void;
  nameError?: string;
}

const COLORS = Object.keys(habitColors) as HabitColor[];
/** Monday-first week for the day picker (0 = Sunday). */
const WEEK = [1, 2, 3, 4, 5, 6, 0];
type ScheduleMode = 'daily' | 'weekdays';

/** Every editable habit field. Controlled: the parent route owns the draft and the save button. */
export function HabitForm({ draft, onChange, nameError }: Props) {
  const t = useT();
  const language = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles();
  const [showAllIcons, setShowAllIcons] = useState(false);
  const days = draft.frequency.type === 'weekdays' ? draft.frequency.days : [];
  const dayDates = dayRange(new Date(), -6, 0);

  const scheduleOptions: SegmentOption<ScheduleMode>[] = [
    { value: 'daily', label: t('habit.everyDay') },
    { value: 'weekdays', label: t('habit.specificDays') },
  ];

  const setSchedule = (mode: ScheduleMode) =>
    onChange({ ...draft, frequency: mode === 'daily' ? { type: 'daily' } : { type: 'weekdays', days: [1, 2, 3, 4, 5] } });

  const toggleDay = (day: number) => {
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    if (next.length === 0) return; // keep at least one day
    onChange({ ...draft, frequency: { type: 'weekdays', days: sortWeekdays(next) } });
  };
  const set = <K extends keyof HabitDraft>(key: K, value: HabitDraft[K]) => onChange({ ...draft, [key]: value });

  const timeOptions: SegmentOption<TimeOfDay>[] = [
    { value: 'morning', label: t('home.morning') },
    { value: 'workload', label: t('home.workload') },
    { value: 'night', label: t('home.night') },
  ];

  const toggleReminder = async (on: boolean) => {
    if (on && !(await ensureNotificationPermission())) {
      Alert.alert(t('habit.reminder'), t('settings.notificationsOff'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.openSettings'), onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    set('reminder', { ...draft.reminder, enabled: on });
  };

  const shownIcons = showAllIcons ? habitIcons : habitIcons.slice(0, 12);
  const accent = habitColors[draft.color].solid;

  return (
    <View style={styles.root}>
      <Field
        label={t('habit.name')}
        placeholder={t('habit.namePlaceholder')}
        value={draft.name}
        onChangeText={(name) => set('name', name)}
        error={nameError}
        maxLength={60}
        returnKeyType="done"
      />

      <View>
        <Text variant="overline" style={styles.label}>
          {t('habit.icon')}
        </Text>
        <View style={styles.iconGrid}>
          {shownIcons.map((key) => {
            const IconCmp = icons[key];
            const active = key === draft.icon;
            return (
              <Pressable
                key={key}
                onPress={() => set('icon', key)}
                scaleTo={0.9}
                accessibilityLabel={key}
                accessibilityState={{ selected: active }}
                style={[styles.iconCell, active && { backgroundColor: accent, borderColor: accent }]}
              >
                <IconCmp size={22} color={active ? colors.white : colors.iconLine} weight={active ? 'fill' : 'light'} />
              </Pressable>
            );
          })}
          {!showAllIcons && (
            <Pressable onPress={() => setShowAllIcons(true)} scaleTo={0.9} accessibilityLabel="More" style={styles.iconCell}>
              <icons.dotsThree size={22} color={colors.iconLine} weight="bold" />
            </Pressable>
          )}
        </View>
      </View>

      <View>
        <Text variant="overline" style={styles.label}>
          {t('habit.color')}
        </Text>
        <View style={styles.colors}>
          {COLORS.map((c) => {
            const active = c === draft.color;
            return (
              <Pressable
                key={c}
                onPress={() => set('color', c)}
                scaleTo={0.85}
                accessibilityLabel={c}
                accessibilityState={{ selected: active }}
                style={[styles.colorDot, { backgroundColor: habitColors[c].solid }, active && styles.colorActive]}
              >
                {active && <icons.check size={16} color={colors.white} weight="bold" />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text variant="overline" style={styles.label}>
          {t('habit.timeOfDay')}
        </Text>
        <Segmented options={timeOptions} value={draft.timeOfDay} onChange={(v) => set('timeOfDay', v)} />
      </View>

      <View>
        <Text variant="overline" style={styles.label}>
          {t('habit.schedule')}
        </Text>
        <Segmented
          options={scheduleOptions}
          value={draft.frequency.type === 'weekdays' ? 'weekdays' : 'daily'}
          onChange={setSchedule}
        />
        {draft.frequency.type === 'weekdays' && (
          <View style={styles.days}>
            {WEEK.map((day) => {
              const active = days.includes(day);
              const date = dayDates.find((d) => d.date.getDay() === day)!.date;
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  scaleTo={0.88}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={formatWeekday(date, language, 'long')}
                  style={[styles.day, active && styles.dayActive]}
                >
                  <Text variant="chip" color={active ? 'white' : 'textBody'}>
                    {formatWeekday(date, language, 'narrow')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View>
        <Text variant="overline" style={styles.label}>
          {t('habit.goal')}
        </Text>
        <View style={styles.goalRow}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => set('target', Math.max(1, draft.target - 1))}
              scaleTo={0.85}
              accessibilityLabel="-"
              style={styles.stepBtn}
            >
              <icons.minus size={18} color={colors.text} weight="bold" />
            </Pressable>
            <Text variant="h2" tabular style={styles.stepValue}>
              {draft.target}
            </Text>
            <Pressable
              onPress={() => set('target', Math.min(999, draft.target + 1))}
              scaleTo={0.85}
              accessibilityLabel="+"
              style={styles.stepBtn}
            >
              <icons.plus size={18} color={colors.text} weight="bold" />
            </Pressable>
          </View>
          {draft.target > 1 && (
            <Field
              placeholder={t('habit.unitPlaceholder')}
              value={draft.unit ?? ''}
              onChangeText={(unit) => set('unit', unit || undefined)}
              maxLength={16}
              style={styles.flex}
            />
          )}
        </View>
      </View>

      <View style={styles.reminder}>
        <View style={styles.reminderHead}>
          <View style={styles.flex}>
            <Text variant="title" color="text">
              {t('habit.reminder')}
            </Text>
            <Text variant="caption">{t('habit.reminderSub')}</Text>
          </View>
          <Switch value={draft.reminder.enabled} onValueChange={toggleReminder} accessibilityLabel={t('habit.reminder')} />
        </View>
        {draft.reminder.enabled && (
          <TimeChips value={draft.reminder} onChange={(time) => set('reminder', { ...draft.reminder, ...time })} />
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.xl },
  flex: { flex: 1 },
  label: { marginBottom: t.space.sm, marginStart: t.space.xs },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: t.radius.input,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Padding leaves room for the selection ring (drawn outside the dot) so it isn't clipped.
  colors: { flexDirection: 'row', gap: t.space.md, flexWrap: 'wrap', padding: 6 },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorActive: { boxShadow: `0 0 0 3px ${t.colors.screen}, 0 0 0 5px ${t.colors.text}` },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: t.space.md },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  dayActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: 4,
  },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.tile, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 44, textAlign: 'center' },
  reminder: {
    gap: t.space.md,
    padding: t.space.lg,
    borderRadius: t.radius.card,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  reminderHead: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
}));

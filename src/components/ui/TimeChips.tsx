import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

import { useLanguage } from '@/i18n';
import { makeStyles } from '@/theme';
import type { ReminderTime } from '@/types/settings';

import { Pressable } from './Pressable';
import { Text } from './Text';

const PRESETS: ReminderTime[] = [6, 7, 8, 9, 12, 15, 18, 20, 21, 22].map((hour) => ({ hour, minute: 0 }));

interface Props {
  value: ReminderTime;
  onChange: (time: ReminderTime) => void;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Horizontal row of reminder times, formatted for the user's language (7 AM / 07:00). */
export function TimeChips({ value, onChange, contentStyle }: Props) {
  const language = useLanguage();
  const styles = useStyles();

  const label = (time: ReminderTime) => {
    const date = new Date();
    date.setHours(time.hour, time.minute, 0, 0);
    return date.toLocaleTimeString(language.code, { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, contentStyle]}>
      {PRESETS.map((preset) => {
        const active = preset.hour === value.hour && preset.minute === value.minute;
        return (
          <Pressable
            key={preset.hour}
            onPress={() => onChange(preset)}
            scaleTo={0.92}
            accessibilityState={{ selected: active }}
            accessibilityLabel={label(preset)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text variant="chip" color={active ? 'white' : 'textBody'} tabular>
              {label(preset)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  row: { gap: t.space.sm },
  chip: {
    paddingHorizontal: t.space.md,
    paddingVertical: 7,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.tile,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
}));

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { GlassCard } from '@/components/glass/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';

export interface DayBar {
  key: string;
  label: string;
  done: number;
  total: number;
  isToday: boolean;
}

interface Props {
  streak: number;
  days: DayBar[];
}

const BAR_HEIGHT = 92;

/** "Your streak" card: flame count + one bar per day showing how much got done. */
export function StreakCard({ streak, days }: Props) {
  const t = useT();
  const styles = useStyles();
  const perfectDays = days.filter((d) => d.total > 0 && d.done >= d.total).length;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text variant="h2">{t('home.streakTitle')}</Text>
          <Text variant="body">{t('home.daysComplete', { done: perfectDays, total: days.length })}</Text>
        </View>
        <Chip label={t('home.streakDays', { count: streak })} tone="streak" icon={icons.flame} />
      </View>
      <View style={styles.bars}>
        {days.map((day, i) => (
          <Bar key={day.key} day={day} index={i} />
        ))}
      </View>
    </GlassCard>
  );
}

function Bar({ day, index }: { day: DayBar; index: number }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const ratio = day.total > 0 ? Math.min(day.done / day.total, 1) : 0;
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.set(withDelay(index * 50, withTiming(ratio, { duration: 600 })));
  }, [ratio, index, fill]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));
  const full = ratio >= 1;

  return (
    <View style={styles.barCol} accessible accessibilityLabel={`${day.label}: ${day.done}/${day.total}`}>
      <Text variant="caption" tabular color={day.isToday ? 'primary' : 'textMuted'}>
        {Math.round(ratio * 100)}%
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: full || day.isToday ? colors.primary : colors.primaryLine },
            fillStyle,
          ]}
        />
      </View>
      <Text variant={day.isToday ? 'chip' : 'caption'} color={day.isToday ? 'text' : 'textMuted'}>
        {day.label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {},
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space.md },
  flex: { flex: 1, gap: 2 },
  bars: { flexDirection: 'row', gap: 10, marginTop: t.space.xl },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  track: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: 10,
    backgroundColor: t.colors.tile,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 10 },
}));

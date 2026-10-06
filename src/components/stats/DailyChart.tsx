import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { makeStyles, useTheme } from '@/theme';

export interface ChartDay {
  key: string;
  /** Shown under the bar; empty string hides it (dense month view). */
  label: string;
  ratio: number;
  isToday: boolean;
}

const HEIGHT = 130;

/** One bar per day; full days are solid blue, partial days light blue, today always solid. */
export function DailyChart({ days }: { days: ChartDay[] }) {
  const styles = useStyles();
  const dense = days.length > 10;
  return (
    <View style={[styles.row, dense && styles.rowDense]}>
      {days.map((day, i) => (
        <Bar key={day.key} day={day} index={i} dense={dense} />
      ))}
    </View>
  );
}

function Bar({ day, index, dense }: { day: ChartDay; index: number; dense: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.set(withDelay(index * (dense ? 12 : 45), withTiming(day.ratio, { duration: 550 })));
  }, [day.ratio, index, dense, fill]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${Math.max(fill.value, 0.02) * 100}%` }));
  const solid = day.ratio >= 1 || day.isToday;

  return (
    <View style={styles.col} accessible accessibilityLabel={`${day.label || day.key}: ${Math.round(day.ratio * 100)}%`}>
      <View style={[styles.track, dense && styles.trackDense]}>
        <Animated.View style={[styles.fill, { backgroundColor: solid ? colors.primary : colors.primaryLine }, fillStyle]} />
      </View>
      <Text variant="caption" color={day.isToday ? 'primary' : 'textMuted'} numberOfLines={1} style={styles.label}>
        {day.label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: 10, marginTop: t.space.lg },
  rowDense: { gap: 3 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  track: {
    width: '100%',
    height: HEIGHT,
    borderRadius: 10,
    backgroundColor: t.colors.tile,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trackDense: { borderRadius: 4 },
  fill: { width: '100%', borderRadius: 4 },
  label: { fontSize: 11, minHeight: 14 },
}));

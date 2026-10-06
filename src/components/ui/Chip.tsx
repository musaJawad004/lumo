import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { Icon } from '@/constants/icons';
import { makeStyles, useTheme, type ColorToken } from '@/theme';

import { Text } from './Text';

type Tone = 'primary' | 'streak' | 'success' | 'neutral';

interface Props {
  label: string;
  tone?: Tone;
  icon?: Icon;
  style?: StyleProp<ViewStyle>;
}

const tones: Record<Tone, { fg: ColorToken; bg: ColorToken; line: ColorToken }> = {
  primary: { fg: 'primary', bg: 'primarySoft', line: 'primaryLine' },
  streak: { fg: 'streak', bg: 'streakSoft', line: 'streakLine' },
  success: { fg: 'success', bg: 'successSoft', line: 'successLine' },
  neutral: { fg: 'textMuted', bg: 'tile', line: 'border' },
};

/** Small pill label, e.g. "Daily", "🔥 12", "Done". */
export function Chip({ label, tone = 'primary', icon: IconCmp, style }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const t = tones[tone];

  return (
    <View style={[styles.root, { backgroundColor: colors[t.bg], borderColor: colors[t.line] }, style]}>
      {IconCmp && <IconCmp size={12} color={colors[t.fg]} weight="fill" />}
      <Text variant="chip" color={t.fg} style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xs,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: t.radius.pill,
    borderWidth: 1,
  },
  text: { fontSize: 12 },
}));

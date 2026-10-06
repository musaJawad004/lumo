import { View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Text } from '@/components/ui/Text';
import type { Icon } from '@/constants/icons';
import { makeStyles } from '@/theme';

interface Props {
  icon: Icon;
  color: string;
  value: string;
  label: string;
}

/** Small glass card: icon, big number, caption. Three sit side by side on Stats. */
export function StatTile({ icon: IconCmp, color, value, label }: Props) {
  const styles = useStyles();
  return (
    <GlassCard radius={20} style={styles.flex}>
      <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
        <IconCmp size={18} color={color} weight="fill" />
      </View>
      <Text variant="h1" tabular numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
        {value}
      </Text>
      <Text variant="caption" numberOfLines={2}>
        {label}
      </Text>
    </GlassCard>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  value: { marginTop: t.space.md },
}));

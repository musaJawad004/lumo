import { View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { makeStyles } from '@/theme';

/** Loading placeholders that mirror the real layouts, so content doesn't jump when it arrives. */

function Row() {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Skeleton width={22} height={22} radius={7} />
      <Skeleton width={18} height={18} radius={9} />
      <Skeleton width="55%" height={14} radius={7} />
    </View>
  );
}

export function HomeSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.stack}>
      <View style={styles.week}>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} height={84} radius={999} style={styles.flex} />
        ))}
      </View>
      <GlassCard radius={28}>
        <Skeleton height={44} radius={999} />
        <View style={styles.section}>
          <Skeleton width={120} height={18} radius={9} />
          {Array.from({ length: 3 }, (_, i) => (
            <Row key={i} />
          ))}
          <Skeleton width={110} height={18} radius={9} style={styles.gapTop} />
          {Array.from({ length: 3 }, (_, i) => (
            <Row key={`b${i}`} />
          ))}
        </View>
      </GlassCard>
      <GlassCard radius={24}>
        <Skeleton width={140} height={18} radius={9} />
        <View style={styles.bars}>
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} height={92} radius={10} style={styles.flex} />
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <GlassCard key={i} radius={20} padded={false}>
          <View style={styles.listRow}>
            <Skeleton width={44} height={44} radius={14} />
            <View style={styles.flexGap}>
              <Skeleton width="60%" height={14} radius={7} />
              <Skeleton width="35%" height={11} radius={6} />
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

export function StatsSkeleton() {
  const styles = useStyles();
  return (
    <View style={styles.stack}>
      <View style={styles.tiles}>
        {Array.from({ length: 3 }, (_, i) => (
          <GlassCard key={i} radius={20} style={styles.flex}>
            <Skeleton width={28} height={28} radius={14} />
            <Skeleton width="70%" height={22} radius={8} style={styles.gapTop} />
            <Skeleton width="90%" height={11} radius={6} style={styles.gapSmall} />
          </GlassCard>
        ))}
      </View>
      <GlassCard radius={24}>
        <Skeleton width={150} height={18} radius={9} />
        <View style={styles.bars}>
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} height={130} radius={10} style={styles.flex} />
          ))}
        </View>
      </GlassCard>
      <ListSkeleton count={3} />
    </View>
  );
}

export function ProfileSkeleton() {
  const styles = useStyles();
  return (
    <GlassCard radius={24}>
      <View style={styles.listRow}>
        <Skeleton width={60} height={60} radius={30} />
        <View style={styles.flexGap}>
          <Skeleton width="55%" height={18} radius={9} />
          <Skeleton width="75%" height={12} radius={6} />
          <Skeleton width="40%" height={10} radius={5} />
        </View>
      </View>
    </GlassCard>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: t.space.sm },
  stack: { gap: t.space.xl },
  week: { flexDirection: 'row', gap: 6 },
  section: { marginTop: t.space.lg, gap: t.space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, paddingStart: t.space.xl, paddingVertical: 4 },
  gapTop: { marginTop: t.space.md },
  gapSmall: { marginTop: t.space.sm },
  bars: { flexDirection: 'row', gap: 10, marginTop: t.space.xl },
  list: { gap: t.space.md },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, padding: t.space.md },
  tiles: { flexDirection: 'row', gap: t.space.md },
}));

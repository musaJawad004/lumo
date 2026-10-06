import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { makeStyles } from '@/theme';

/** Shown instead of the app until the Supabase keys are in .env (developer setup step). */
export function NotConfigured() {
  const t = useT();
  const styles = useStyles();
  return (
    <Screen scroll={false} contentStyle={styles.center}>
      <GlassCard radius={28}>
        <EmptyState icon={icons.lock} title={t('auth.notConfiguredTitle')} body={t('auth.notConfiguredBody')} />
      </GlassCard>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  center: { justifyContent: 'center' },
}));

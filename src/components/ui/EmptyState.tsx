import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { Icon } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

interface Props {
  icon: Icon;
  title: string;
  body: string;
  /** Optional action, e.g. a Button. */
  action?: ReactNode;
}

/** Centered icon + message for empty lists and screens that aren't built yet. */
export function EmptyState({ icon: IconCmp, title, body, action }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <IconCmp size={40} color={colors.primary} weight="light" />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      <Text variant="body" align="center" style={styles.body}>
        {body}
      </Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { alignItems: 'center', gap: t.space.md, paddingVertical: t.space.xxxl, paddingHorizontal: t.space.xl },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.space.sm,
  },
  body: { maxWidth: 300, marginBottom: t.space.sm },
  action: { alignSelf: 'center', alignItems: 'center' },
}));

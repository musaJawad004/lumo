import { I18nManager, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Icon } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

import { Pressable } from './Pressable';

interface Props {
  icon: Icon;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Shows a small red dot (e.g. unread notifications). */
  badge?: boolean;
  /** Flip directional icons (back arrows) in right-to-left languages. */
  mirrorInRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** 44pt round white button with a soft shadow, used in the top bar. */
export function IconButton({ icon: IconCmp, onPress, accessibilityLabel, badge, mirrorInRTL, style }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Pressable onPress={onPress} accessibilityLabel={accessibilityLabel} scaleTo={0.92} style={[styles.root, style]}>
      <IconCmp size={22} color={colors.textBody} weight="light" mirrored={mirrorInRTL && I18nManager.isRTL} />
      {badge && <View style={styles.badge} />}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    width: t.layout.iconButton,
    height: t.layout.iconButton,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...t.shadow.card,
  },
  badge: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.danger,
    borderWidth: 1.5,
    borderColor: t.colors.surface,
  },
}));

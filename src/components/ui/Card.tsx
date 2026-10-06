import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@/theme';

import { Pressable } from './Pressable';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
  /** Use the gray tile surface instead of white (feature tiles). */
  tone?: 'surface' | 'tile';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** White rounded card with a soft shadow. Becomes pressable when given onPress. */
export function Card({
  children,
  onPress,
  onLongPress,
  accessibilityLabel,
  tone = 'surface',
  padded = true,
  style,
}: Props) {
  const styles = useStyles();
  const cardStyle = [styles.base, tone === 'tile' ? styles.tile : styles.surface, padded && styles.padded, style];

  if (onPress || onLongPress) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityLabel={accessibilityLabel} style={cardStyle}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  base: { borderRadius: t.radius.card },
  surface: { backgroundColor: t.colors.surface, ...t.shadow.card },
  tile: { backgroundColor: t.colors.tile, borderWidth: 1, borderColor: t.colors.border },
  padded: { padding: t.space.lg },
}));

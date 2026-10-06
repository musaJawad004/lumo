import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'lime' | 'brand';

interface Props {
  name: string;
  uri?: string;
  size?: number;
  /** Gradient used when there's no photo. */
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

const gradients: Record<Variant, [string, string]> = {
  lime: ['#D4F25A', '#9BE15D'],
  brand: ['#1F5BFF', '#4C8DFF'],
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Round avatar: photo if given, otherwise initials on a gradient. */
export function Avatar({ name, uri, size = 40, variant = 'lime', style }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <View style={[styles.clip, round, style]} accessibilityLabel={name} accessibilityRole="image">
        <Image source={{ uri }} style={round} contentFit="cover" transition={200} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.center, round, style]}
      accessibilityLabel={name}
      accessibilityRole="image"
    >
      <Text
        variant="bodyStrong"
        color={variant === 'lime' ? '#1C1C1E' : colors.white}
        style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}
      >
        {initials(name)}
      </Text>
    </LinearGradient>
  );
}

const useStyles = makeStyles(() => ({
  clip: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
}));

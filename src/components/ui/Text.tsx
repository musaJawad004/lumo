import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type ColorToken, type TextVariant } from '@/theme';
import { variantColor } from '@/theme/typography';

interface Props extends TextProps {
  variant?: TextVariant;
  /** A theme color token (preferred) or a raw color string. */
  color?: ColorToken | (string & {});
  align?: TextStyle['textAlign'];
  /** Use tabular numbers so counters don't shift width as they change. */
  tabular?: boolean;
}

/** The only component that should render text in Lumo. */
export function Text({
  variant = 'body',
  color,
  align,
  tabular,
  style,
  maxFontSizeMultiplier = 1.3,
  ...rest
}: Props) {
  const { colors, type } = useTheme();
  const resolved = color
    ? color in colors
      ? colors[color as ColorToken]
      : color
    : colors[variantColor[variant]];

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        type[variant],
        { color: resolved },
        align && { textAlign: align },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
      {...rest}
    />
  );
}

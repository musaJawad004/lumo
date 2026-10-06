import { useState } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { icons, type Icon } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: Icon;
  /** Short text shown at the right edge, e.g. a unit ("pages"). */
  suffix?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

/** Labeled text input on a white rounded surface. The border turns indigo while focused. */
export function Field({
  label,
  icon: IconCmp,
  suffix,
  error,
  style,
  onFocus,
  onBlur,
  multiline,
  secureTextEntry,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  // Password fields get an eye button to reveal what was typed.
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={style}>
      {label && (
        <Text variant="chip" color="textMuted" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={[styles.box, multiline && styles.multiline, { borderColor }]}>
        {IconCmp && <IconCmp size={20} color={focused ? colors.primary : colors.iconLine} weight="light" />}
        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          maxFontSizeMultiplier={1.3}
          accessibilityLabel={label}
          multiline={multiline}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline]}
          {...rest}
        />
        {suffix && <Text variant="label" color="textMuted">{suffix}</Text>}
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            haptic="selection"
            scaleTo={0.85}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            {hidden ? (
              <icons.eye size={20} color={colors.iconLine} weight="light" />
            ) : (
              <icons.eyeSlash size={20} color={colors.primary} weight="light" />
            )}
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="caption" color="danger" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  // Flush with the box edge so labels and fields line up in a straight column.
  label: { marginBottom: t.space.sm },
  box: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm + 2,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.input,
    borderWidth: 1,
    backgroundColor: t.colors.surface,
  },
  multiline: { height: undefined, minHeight: 104, alignItems: 'flex-start', paddingVertical: t.space.md },
  // No lineHeight / vertical padding on single-line inputs: iOS then centers the text (and password
  // dots) exactly in the 52pt box instead of nudging them down.
  input: {
    flex: 1,
    height: '100%',
    fontFamily: t.type.name.fontFamily,
    fontSize: t.type.name.fontSize,
    letterSpacing: t.type.name.letterSpacing,
    color: t.colors.text,
    paddingVertical: 0,
  },
  inputMultiline: { height: undefined, minHeight: 80, lineHeight: t.type.name.lineHeight, textAlignVertical: 'top' },
  error: { marginTop: t.space.xs },
}));

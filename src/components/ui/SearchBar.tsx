import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { icons } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

/** 44pt pill search field. */
export function SearchBar({ value, onChangeText, placeholder = 'Search habits', style }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={[styles.root, style]}>
      <icons.magnifyingGlass size={20} color={colors.textMuted} weight="light" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        returnKeyType="search"
        clearButtonMode="while-editing"
        maxFontSizeMultiplier={1.3}
        accessibilityLabel={placeholder}
        style={styles.input}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    height: t.layout.searchHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    paddingHorizontal: 14,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surface,
    ...t.shadow.card,
  },
  input: { flex: 1, height: '100%', ...t.type.body, color: t.colors.text },
}));

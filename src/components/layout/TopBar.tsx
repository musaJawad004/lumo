import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { icons } from '@/constants/icons';
import { makeStyles } from '@/theme';

interface Props {
  search: string;
  onSearchChange: (text: string) => void;
  onMenuPress?: () => void;
  onBellPress?: () => void;
  hasNotifications?: boolean;
}

/** Menu · search · bell row from the reference design. */
export function TopBar({ search, onSearchChange, onMenuPress, onBellPress, hasNotifications }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <IconButton icon={icons.list} onPress={onMenuPress} accessibilityLabel="Menu" />
      <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search habits, tips" />
      <IconButton icon={icons.bell} onPress={onBellPress} badge={hasNotifications} accessibilityLabel="Notifications" />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2 },
}));

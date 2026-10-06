import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { icons } from '@/constants/icons';
import { makeStyles } from '@/theme';

interface Props {
  title: string;
  subtitle: string;
  name: string;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
  onAddPress?: () => void;
  addLabel?: string;
}

const SIZE = 42;

/** Greeting line + a ＋ (new habit) button + the user's profile photo, which opens the profile. */
export function GreetingHeader({ title, subtitle, name, avatarUrl, onAvatarPress, onAddPress, addLabel }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.text}>
        <Text variant="h1" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="body" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {onAddPress && <IconButton icon={icons.plus} onPress={onAddPress} accessibilityLabel={addLabel ?? '+'} />}
      <Pressable onPress={onAvatarPress} scaleTo={0.9} accessibilityLabel={name} style={styles.ring}>
        <Avatar name={name} uri={avatarUrl ?? undefined} size={SIZE} variant="brand" />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm + 2 },
  text: { flex: 1, gap: 2 },
  ring: {
    borderRadius: SIZE,
    padding: 2,
    borderWidth: 1.5,
    borderColor: t.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(47,107,255,0.25)',
  },
}));

import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { makeStyles } from '@/theme';

interface Props {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

/** "Today's Habits ........ (View All)" */
export function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && <Button label={actionLabel} onPress={onActionPress} variant="soft" size="sm" />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.layout.sectionGap,
    marginBottom: t.space.md,
    minHeight: 30,
  },
}));

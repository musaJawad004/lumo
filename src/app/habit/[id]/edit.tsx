import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { GlassSheet } from '@/components/glass/GlassSheet';
import { HabitForm } from '@/components/habit/HabitForm';
import { Button } from '@/components/ui';
import { useT } from '@/i18n';
import { removeHabit, updateHabit } from '@/services/habits';
import { useHabitStore } from '@/store/habitStore';
import { makeStyles } from '@/theme';
import type { HabitDraft } from '@/types/habit';

export default function EditHabitScreen() {
  const t = useT();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const [draft, setDraft] = useState<HabitDraft | undefined>(
    habit && {
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      target: habit.target,
      unit: habit.unit,
      timeOfDay: habit.timeOfDay,
      frequency: habit.frequency,
      reminder: habit.reminder,
    },
  );
  const [nameError, setNameError] = useState<string>();

  if (!habit || !draft) {
    // Deleted (or opened from a stale notification): just close.
    return <GlassSheet onClose={() => router.back()}>{null}</GlassSheet>;
  }

  const save = () => {
    if (!draft.name.trim()) return setNameError(t('habit.errName'));
    updateHabit(habit.id, draft);
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert(t('habit.deleteTitle'), t('habit.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeHabit(habit.id);
          router.dismissTo('/habits');
        },
      },
    ]);

  return (
    <GlassSheet
      title={t('habit.editTitle')}
      onClose={() => router.back()}
      footer={
        <View style={styles.footer}>
          <Button label={t('habit.save')} fullWidth onPress={save} />
          <Button
            label={habit.archived ? t('habit.unarchive') : t('habit.archive')}
            variant="soft"
            fullWidth
            onPress={() => {
              updateHabit(habit.id, { archived: !habit.archived });
              router.dismissTo('/habits');
            }}
          />
          <Button label={t('habit.delete')} variant="ghost" fullWidth onPress={confirmDelete} labelColor="danger" />
        </View>
      }
    >
      <HabitForm
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          if (nameError && next.name.trim()) setNameError(undefined);
        }}
        nameError={nameError}
      />
    </GlassSheet>
  );
}

const useStyles = makeStyles((t) => ({
  footer: { gap: t.space.xs },
}));

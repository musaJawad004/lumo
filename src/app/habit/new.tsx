import { router } from 'expo-router';
import { useState } from 'react';

import { GlassSheet } from '@/components/glass/GlassSheet';
import { HabitForm } from '@/components/habit/HabitForm';
import { Button } from '@/components/ui';
import { useT } from '@/i18n';
import { createHabit } from '@/services/habits';
import type { HabitDraft } from '@/types/habit';

const EMPTY: HabitDraft = {
  name: '',
  icon: 'drop',
  color: 'blue',
  target: 1,
  timeOfDay: 'morning',
  frequency: { type: 'daily' },
  reminder: { enabled: false, hour: 8, minute: 0 },
};

export default function NewHabitScreen() {
  const t = useT();
  const [draft, setDraft] = useState<HabitDraft>(EMPTY);
  const [nameError, setNameError] = useState<string>();

  const submit = () => {
    if (!draft.name.trim()) return setNameError(t('habit.errName'));
    createHabit(draft);
    router.back();
  };

  return (
    <GlassSheet
      title={t('habit.newTitle')}
      onClose={() => router.back()}
      footer={<Button label={t('habit.create')} fullWidth onPress={submit} />}
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

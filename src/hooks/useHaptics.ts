import { useCallback } from 'react';

import { playHaptic, type HapticKind } from '@/services/haptics';
import { useSettingsStore } from '@/store/settingsStore';

/** Haptics that respect the user's Settings toggle. */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);
  return useCallback(
    (kind: HapticKind) => {
      if (enabled) playHaptic(kind);
    },
    [enabled],
  );
}

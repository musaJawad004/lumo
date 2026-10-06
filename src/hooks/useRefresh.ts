import { useCallback, useState } from 'react';

import { refreshUserData } from '@/services/session';
import { useSyncStore } from '@/store/syncStore';

/** Pull-to-refresh wiring + whether to show skeletons (first load with nothing cached yet). */
export function useRefresh(hasData: boolean) {
  const [refreshing, setRefreshing] = useState(false);
  const loading = useSyncStore((s) => s.status === 'loading');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, []);

  return { refreshing, onRefresh, showSkeleton: loading && !hasData };
}

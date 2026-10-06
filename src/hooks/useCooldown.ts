import { useEffect, useState } from 'react';

/** Countdown in seconds; `start()` restarts it. Used to rate-limit "Resend email". */
export function useCooldown(seconds: number, startNow = false) {
  const [left, setLeft] = useState(startNow ? seconds : 0);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return { left, start: () => setLeft(seconds) };
}

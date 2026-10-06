import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { useCooldown } from '@/hooks/useCooldown';
import { useT } from '@/i18n';
import { resendConfirmation } from '@/services/api/account';
import { describeAuthError } from '@/utils/validation';

/** "Resend email" with a 60 s cooldown (Supabase rate-limits confirmation emails). */
export function ResendEmail({ email, startCooling = false }: { email: string; startCooling?: boolean }) {
  const t = useT();
  // Right after sign-up an email was just sent, so start cooling immediately.
  const cooldown = useCooldown(60, startCooling);
  const [state, setState] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await resendConfirmation(email);
      setState({ tone: 'success', message: t('auth.resent') });
      cooldown.start();
    } catch (error) {
      setState({ tone: 'error', message: describeAuthError(error, t) ?? t('auth.errGeneric') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {state && <Notice tone={state.tone} message={state.message} />}
      <Button
        label={cooldown.left > 0 ? t('auth.resendIn', { seconds: cooldown.left }) : t('auth.resend')}
        variant="soft"
        fullWidth
        loading={loading}
        disabled={cooldown.left > 0}
        onPress={resend}
      />
    </>
  );
}

import { reloadAppAsync } from 'expo';
import { I18nManager } from 'react-native';

/** True when the native layout direction doesn't match the language yet. */
export function needsDirectionChange(rtl: boolean): boolean {
  return I18nManager.isRTL !== rtl;
}

/**
 * Flips the native layout direction and restarts the JS app so every screen re-lays out.
 * (React Native only applies RTL at startup.)
 */
export async function applyDirection(rtl: boolean): Promise<void> {
  if (!needsDirectionChange(rtl)) return;
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  await reloadAppAsync('Layout direction changed');
}

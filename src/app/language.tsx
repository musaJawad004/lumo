import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { FadeIn } from '@/components/motion/FadeIn';
import { IconButton, ListGroup, ListRow, Text } from '@/components/ui';
import { icons } from '@/constants/icons';
import { deviceLanguage, languageByCode, languages, resolveLanguage, translate, useT } from '@/i18n';
import { applyDirection, needsDirectionChange } from '@/services/direction';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme';
import type { LanguagePreference } from '@/types/settings';

/** Language picker: device language + the 10 supported languages. RTL switches restart the app. */
export default function LanguageScreen() {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const current = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const device = languageByCode[deviceLanguage()];

  const choose = (next: LanguagePreference) => {
    if (next === current) return;
    setLanguage(next);
    const target = resolveLanguage(next);
    if (!needsDirectionChange(target.rtl)) return;
    // Ask in the language the user just picked.
    Alert.alert(translate(target, 'settings.restartTitle'), translate(target, 'settings.restartBody'), [
      { text: translate(target, 'settings.restart'), onPress: () => applyDirection(target.rtl) },
    ]);
  };

  const check = <icons.checkCircle size={22} color={colors.primary} weight="fill" />;

  return (
    <Screen>
      <FadeIn style={styles.header}>
        <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
        <Text variant="h1">{t('settings.language')}</Text>
      </FadeIn>

      <FadeIn index={1}>
        <ListGroup>
          <ListRow
            icon={icons.deviceMobile}
            iconColor={colors.textMuted}
            title={t('settings.deviceLanguage')}
            subtitle={device.nativeName}
            right={current === 'system' ? check : <View style={styles.spacer} />}
            onPress={() => choose('system')}
          />
        </ListGroup>
      </FadeIn>

      <FadeIn index={2} style={styles.list}>
        <ListGroup>
          {languages.map((language) => (
            <ListRow
              key={language.code}
              title={language.nativeName}
              subtitle={language.name}
              right={current === language.code ? check : <View style={styles.spacer} />}
              onPress={() => choose(language.code)}
            />
          ))}
        </ListGroup>
      </FadeIn>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, marginBottom: t.space.xl },
  list: { marginTop: t.space.lg },
  spacer: { width: 22 },
}));

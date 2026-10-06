import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { makeStyles } from '@/theme';

const logo = require('../../../assets/splash-icon.png');

/** Logo, name, version and tagline at the bottom of Settings. */
export function AboutFooter() {
  const t = useT();
  const styles = useStyles();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.root} accessible accessibilityLabel={`Lumo ${t('settings.version')} ${version}`}>
      <Image source={logo} style={styles.logo} />
      <Text variant="title" color="text">
        Lumo
      </Text>
      <Text variant="caption">
        {t('settings.version')} {version}
      </Text>
      <Text variant="caption">{t('settings.tagline')}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { alignItems: 'center', gap: 2, marginTop: t.space.xxxl },
  logo: { width: 48, height: 48, marginBottom: t.space.sm },
}));

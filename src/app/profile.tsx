import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { FadeIn } from '@/components/motion/FadeIn';
import { Avatar, Button, Field, IconButton, Pressable, Text } from '@/components/ui';
import { icons } from '@/constants/icons';
import { useT } from '@/i18n';
import { updateProfile, uploadAvatar } from '@/services/api/account';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { makeStyles, useTheme } from '@/theme';
import { describeAuthError } from '@/utils/validation';

/** Edit name + profile photo. Photos go to Supabase Storage (avatars/<user id>/). */
export default function EditProfileScreen() {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const userId = useAuthStore((s) => s.userId);
  const profile = useProfileStore((s) => s.profile);
  const patchProfile = useProfileStore((s) => s.patchProfile);
  const [name, setName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!userId || !profile) return null;

  const fail = (error: unknown) => Alert.alert(t('common.error'), describeAuthError(error, t) ?? t('auth.errGeneric'));

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profile.changePhoto'), t('profile.photoPermission'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.openSettings'), onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;

    setUploading(true);
    try {
      const url = await uploadAvatar(userId, asset.uri, asset.mimeType ?? 'image/jpeg');
      await updateProfile(userId, { avatarUrl: url });
      patchProfile({ avatarUrl: url });
    } catch (error) {
      fail(error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      await updateProfile(userId, { avatarUrl: null });
      patchProfile({ avatarUrl: null });
    } catch (error) {
      fail(error);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(userId, { displayName: name });
      patchProfile({ displayName: name.trim() });
      router.back();
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <FadeIn style={styles.header}>
        <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
        <Text variant="h1">{t('profile.editTitle')}</Text>
      </FadeIn>

      <FadeIn index={1} style={styles.photo}>
        <Pressable onPress={pickPhoto} scaleTo={0.95} accessibilityLabel={t('profile.changePhoto')} style={styles.avatarWrap}>
          <Avatar name={name || profile.email || 'Lumo'} uri={profile.avatarUrl ?? undefined} size={112} variant="brand" />
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <icons.camera size={18} color={colors.white} weight="fill" />
            )}
          </View>
        </Pressable>
        <View style={styles.photoActions}>
          <Button label={t('profile.changePhoto')} variant="soft" size="sm" onPress={pickPhoto} disabled={uploading} />
          {profile.avatarUrl && (
            <Button label={t('profile.removePhoto')} variant="ghost" size="sm" labelColor="danger" onPress={removePhoto} />
          )}
        </View>
      </FadeIn>

      <FadeIn index={2}>
        <GlassCard radius={24}>
          <View style={styles.form}>
            <Field
              label={t('auth.name')}
              placeholder={t('auth.namePlaceholder')}
              icon={icons.user}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              maxLength={40}
            />
            <Field label={t('auth.email')} icon={icons.envelope} value={profile.email} editable={false} />
            <Button label={t('common.save')} fullWidth loading={saving} onPress={save} />
          </View>
        </GlassCard>
      </FadeIn>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, marginBottom: t.space.xl },
  photo: { alignItems: 'center', gap: t.space.md, marginBottom: t.space.xl },
  avatarWrap: { borderRadius: 60, padding: 4, borderWidth: 1, borderColor: t.glass.border, backgroundColor: t.glass.cardFill },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    end: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: t.colors.primary,
    borderWidth: 3,
    borderColor: t.colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: { flexDirection: 'row', gap: t.space.sm },
  form: { gap: t.space.lg },
}));

import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { GlassCard } from '../components/ui/GlassCard';
import { Screen } from '../components/ui/Screen';
import { resetSettings, saveSetting, settingsKeys, useProfile, useTasks } from '../lib/hooks';
import { clearAll, getItem } from '../lib/storage';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

export function SettingsScreen() {
  const { profile, resetProfile } = useProfile();
  const { resetTasks } = useTasks();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const ai = await getItem<boolean>(settingsKeys.ai, false);
      const notifications = await getItem<boolean>(settingsKeys.notifications, false);
      setAiEnabled(ai);
      setNotificationsEnabled(notifications);
    };
    load();
  }, []);

  const handleReset = () => {
    Alert.alert('Reset local data?', 'This clears profile, tasks, and settings on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          await resetProfile();
          await resetTasks();
          await resetSettings();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.page}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Guest mode · {profile?.displayName ?? 'Guest'}</Text>

        <GlassCard style={styles.profileCard}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardSubtitle}>Keep your flow synced across days.</Text>
          <SecondaryButton label="Upgrade" style={styles.cardButton} onPress={() => console.log('[settings] upgrade placeholder')} />
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <GlassCard style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.cardTitle}>AI Assist</Text>
                <Text style={styles.cardSubtitle}>Stubbed for now. No network calls.</Text>
              </View>
              <Switch
                value={aiEnabled}
                onValueChange={async (value) => {
                  setAiEnabled(value);
                  await saveSetting('ai', value);
                }}
              />
            </View>
          </GlassCard>
          <GlassCard style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.cardTitle}>Notifications</Text>
                <Text style={styles.cardSubtitle}>Placeholder toggle stored locally.</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  setNotificationsEnabled(value);
                  await saveSetting('notifications', value);
                }}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <PrimaryButton label="Reset local data" onPress={handleReset} />
        </View>

        <Text style={styles.footer}>FlowPilot v1.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 140,
    gap: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  profileCard: {
    gap: theme.spacing.sm,
  },
  cardTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 4,
  },
  cardButton: {
    marginTop: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  preferenceCard: {
    marginBottom: theme.spacing.sm,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});

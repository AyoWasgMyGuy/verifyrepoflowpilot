import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
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
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.page} testID="screen-settings">
        <Text style={styles.title}>Settings</Text>

        <SurfaceCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[theme.colors.primary, '#60a5fa']}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.displayName ?? 'Guest'}</Text>
              <Text style={styles.profileBadge}>Guest Mode</Text>
            </View>
          </View>
          <Ionicons name="create-outline" size={18} color={theme.colors.textMuted} />
        </SurfaceCard>

        <LinearGradient colors={['rgba(79,70,229,0.35)', theme.colors.surface]} style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <View style={styles.upgradeTitleRow}>
              <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
              <Text style={styles.upgradeTitle}>FlowPilot Pro</Text>
            </View>
            <View style={styles.upgradeBadge}>
              <Text style={styles.upgradeBadgeText}>UPGRADE</Text>
            </View>
          </View>
          <Text style={styles.upgradeSubtitle}>Unlock AI insights, unlimited tasks, and advanced flow analytics.</Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <SurfaceCard style={styles.listCard}>
          <View style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Ionicons name="moon" size={18} color={theme.colors.textMuted} />
              <Text style={styles.listRowText}>Dark Mode</Text>
            </View>
            <View style={styles.switchPill}>
              <View style={styles.switchKnob} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Ionicons name="notifications" size={18} color={theme.colors.textMuted} />
              <Text style={styles.listRowText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={async (value) => {
                setNotificationsEnabled(value);
                await saveSetting('notifications', value);
              }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Ionicons name="sparkles" size={18} color={theme.colors.textMuted} />
              <View style={styles.aiRow}>
                <Text style={styles.listRowText}>AI Assist</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </View>
        </SurfaceCard>

        <Text style={styles.sectionLabel}>Data & Storage</Text>
        <SurfaceCard style={styles.listCard}>
          <View style={styles.listRow}>
            <View style={styles.listRowLeft}>
              <Ionicons name="download" size={18} color={theme.colors.textMuted} />
              <Text style={styles.listRowText}>Export data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.listRow} onPress={handleReset}>
            <View style={styles.listRowLeft}>
              <Ionicons name="trash" size={18} color={theme.colors.danger} />
              <Text style={[styles.listRowText, styles.dangerText]}>Reset local data</Text>
            </View>
          </Pressable>
        </SurfaceCard>

        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons name="water" size={14} color={theme.colors.bg} />
          </View>
          <Text style={styles.footerText}>FlowPilot v1.0.2</Text>
          <Text style={styles.footerSubtext}>Made with calm.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 180,
    gap: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  profileBadge: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'flex-start',
  },
  upgradeCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upgradeTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  upgradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  upgradeBadgeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 10,
  },
  upgradeSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listCard: {
    padding: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  listRowText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.body,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: theme.spacing.lg,
  },
  switchPill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  proBadgeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 9,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    gap: 4,
  },
  footerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  footerSubtext: {
    color: 'rgba(157,185,185,0.5)',
    fontFamily: theme.fonts.body,
    fontSize: 10,
  },
});

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { saveSetting, useProfile } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding2'>;

export function Onboarding2Screen({ navigation, route }: Props) {
  const { saveProfile } = useProfile();
  const [smartNotify, setSmartNotify] = useState(true);
  const [aiAssist, setAiAssist] = useState(false);

  const displayName = route.params?.displayName ?? 'Guest';
  const workStart = '09:00 AM';
  const workEnd = '05:00 PM';

  const handleFinish = async () => {
    await saveProfile({
      displayName,
      workStart,
      workEnd,
      focusMinutesDefault: 45,
    });
    await saveSetting('notifications', smartNotify);
    await saveSetting('ai', aiAssist);
    navigation.replace('Tabs', { screen: 'Today' });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.progressHeader}>
          <View style={styles.progressRow}>
            <Text style={styles.stepText}>Step 2 of 2</Text>
            <Text style={styles.stepBadge}>100%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroBlock}>
            <Text style={styles.heroTitle}>Set Your Rhythm</Text>
            <Text style={styles.heroSubtitle}>Tell us when you work best so we can protect your time.</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Daily Focus Window</Text>
            </View>
            <View style={styles.windowCard}>
              <View style={styles.windowTicks}>
                <Text style={styles.tickText}>6 AM</Text>
                <Text style={styles.tickText}>12 PM</Text>
                <Text style={styles.tickText}>6 PM</Text>
              </View>
              <View style={styles.sliderTrack}>
                <View style={styles.sliderFill} />
                <View style={[styles.sliderKnob, styles.sliderKnobLeft]}>
                  <View style={styles.sliderKnobDot} />
                </View>
                <View style={[styles.sliderKnob, styles.sliderKnobRight]}>
                  <View style={styles.sliderKnobDot} />
                </View>
              </View>
              <View style={styles.windowTimes}>
                <View>
                  <Text style={styles.windowLabel}>Start</Text>
                  <Text style={styles.windowTime}>{workStart}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                <View style={styles.windowEnd}>
                  <Text style={styles.windowLabel}>End</Text>
                  <Text style={styles.windowTime}>{workEnd}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="options" size={16} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Preferences</Text>
            </View>

            <Pressable style={styles.prefCard} onPress={() => setSmartNotify((prev) => !prev)}>
              <View style={styles.prefInfo}>
                <View style={styles.prefIconPrimary}>
                  <Ionicons name="notifications" size={16} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.prefTitle}>Smart Notifications</Text>
                  <Text style={styles.prefSubtitle}>Only alert me during focus hours</Text>
                </View>
              </View>
              <View style={[styles.toggle, smartNotify && styles.toggleOn]}>
                <View style={[styles.toggleThumb, smartNotify && styles.toggleThumbOn]} />
              </View>
            </Pressable>

            <Pressable style={styles.prefCard} onPress={() => setAiAssist((prev) => !prev)}>
              <View style={styles.prefInfo}>
                <View style={styles.prefIconAccent}>
                  <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
                </View>
                <View>
                  <View style={styles.prefTitleRow}>
                    <Text style={styles.prefTitle}>AI Assist</Text>
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={styles.prefSubtitle}>Auto-schedule tasks based on energy</Text>
                </View>
              </View>
              <View style={[styles.toggle, aiAssist && styles.toggleOn]}>
                <View style={[styles.toggleThumb, aiAssist && styles.toggleThumbOn]} />
              </View>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.bottomDock}>
          <Pressable style={styles.ctaButton} onPress={handleFinish}>
            <Text style={styles.ctaText}>Start using FlowPilot</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.bg} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  progressHeader: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  stepText: {
    color: 'rgba(231,245,245,0.6)',
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  stepBadge: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(19,236,236,0.12)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  heroBlock: {
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 28,
  },
  heroSubtitle: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
  },
  windowCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  windowTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  tickText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: '25%',
    right: '25%',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(19,236,236,0.4)',
  },
  sliderKnob: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderKnobDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sliderKnobLeft: {
    left: '25%',
    marginLeft: -10,
  },
  sliderKnobRight: {
    right: '25%',
    marginRight: -10,
  },
  windowTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  windowLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  windowTime: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
    marginTop: 4,
  },
  windowEnd: {
    alignItems: 'flex-end',
  },
  prefCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  prefInfo: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  prefIconPrimary: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(19,236,236,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefIconAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 14,
  },
  prefSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  prefTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  proBadgeText: {
    color: '#fff',
    fontFamily: theme.fonts.display,
    fontSize: 9,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2a3434',
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    marginLeft: 3,
  },
  toggleThumbOn: {
    marginLeft: 23,
  },
  bottomDock: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
  },
  ctaButton: {
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 15,
  },
});

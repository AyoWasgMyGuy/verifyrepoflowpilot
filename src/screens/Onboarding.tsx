import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { Screen } from '../components/ui/Screen';
import { saveSetting, useProfile } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const focusOptions: Array<25 | 45 | 60> = [25, 45, 60];

export function OnboardingScreen({ navigation }: Props) {
  const { saveProfile } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [focusMinutes, setFocusMinutes] = useState<25 | 45 | 60>(25);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleContinue = async () => {
    await saveProfile({
      displayName: displayName.trim() || 'Guest',
      workStart,
      workEnd,
      focusMinutesDefault: focusMinutes,
    });
    await saveSetting('notifications', notificationsEnabled);
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's set your flow</Text>
          <Text style={styles.subtitle}>A few quick details to personalize Today.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex]}>
            <Text style={styles.label}>Work start</Text>
            <TextInput
              value={workStart}
              onChangeText={setWorkStart}
              placeholder="09:00"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={[styles.field, styles.flex]}>
            <Text style={styles.label}>Work end</Text>
            <TextInput
              value={workEnd}
              onChangeText={setWorkEnd}
              placeholder="17:00"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred focus length</Text>
          <View style={styles.chipRow}>
            {focusOptions.map((option) => (
              <SecondaryButton
                key={option}
                label={`${option} min`}
                onPress={() => setFocusMinutes(option)}
                style={[styles.choiceButton, focusMinutes === option && styles.choiceButtonActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>Notifications</Text>
            <Text style={styles.toggleSubtitle}>Placeholder toggle for now.</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <PrimaryButton label="Continue" onPress={handleContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    gap: 6,
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
  field: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  input: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  choiceButton: {
    opacity: 0.6,
  },
  choiceButtonActive: {
    opacity: 1,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  toggleText: {
    gap: 4,
  },
  toggleTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  toggleSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
});

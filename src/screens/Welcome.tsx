import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { Screen } from '../components/ui/Screen';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>FP</Text>
        </View>
        <Text style={styles.title}>Welcome to FlowPilot</Text>
        <Text style={styles.subtitle}>
          Calm structure for your day, even when things feel heavy.
        </Text>
        <View style={styles.buttonStack}>
          <PrimaryButton
            label="Continue as Guest"
            onPress={() => navigation.navigate('Onboarding', { guest: true })}
          />
          <SecondaryButton
            label="Sign in"
            onPress={() => navigation.navigate('Auth')}
          />
        </View>
        <Text style={styles.footer}>
          By continuing, you agree to FlowPilot's privacy-first approach.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 22,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  buttonStack: {
    marginTop: theme.spacing.xl,
    width: '100%',
    gap: theme.spacing.sm,
  },
  footer: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});

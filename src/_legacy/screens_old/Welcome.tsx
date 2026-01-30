import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.logoTile}>
        <Text style={styles.logoText}>FP</Text>
      </View>
      <Text style={styles.title}>Welcome to FlowPilot</Text>
      <Text style={styles.subtitle}>
        Calm structure for your day, even when things feel heavy.
      </Text>
      <View style={styles.buttonStack}>
        <PrimaryButton label="Continue as Guest" onPress={() => navigation.navigate('Tabs', { screen: 'Today' })} />
        <SecondaryButton label="Sign in" onPress={() => navigation.navigate('Auth')} />
      </View>
      <Text style={styles.footer}>By continuing, you agree to FlowPilot's privacy-first approach.</Text>
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
  logoTile: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 20,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  buttonStack: {
    width: '100%',
    marginTop: theme.spacing.xl,
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

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { useProfile } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { profile } = useProfile();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile) {
        navigation.replace('Tabs', { screen: 'Today' });
      } else {
        navigation.replace('Onboarding');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [navigation, profile]);

  return (
    <Screen style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.logoWrap}>
        <View style={styles.logoGlow} />
        <View style={styles.logoTile}>
          <Ionicons name="water" size={36} color={theme.colors.primary} />
        </View>
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>FlowPilot</Text>
        <Text style={styles.tagline}>Clear your mind. Do what matters.</Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.loadingLabel}>Loading</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  spacer: {
    flex: 1,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19,236,236,0.2)',
    opacity: 0.6,
  },
  logoTile: {
    backgroundColor: '#1a2c2c',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  titleBlock: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 28,
  },
  tagline: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
  },
  progressBlock: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  progressTrack: {
    width: 200,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '33%',
    backgroundColor: theme.colors.primary,
  },
  loadingLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontFamily: theme.fonts.body,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

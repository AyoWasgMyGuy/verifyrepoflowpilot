import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBackground } from '../components/ui/AppBackground';
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
        navigation.replace('Welcome');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [navigation, profile]);

  return (
    <AppBackground intensity="bold">
      <View style={styles.container}>
        <Text style={styles.logo}>FlowPilot</Text>
        <Text style={styles.tagline}>Find your calm focus.</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 30,
  },
  tagline: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: theme.spacing.xs,
  },
  progressTrack: {
    marginTop: theme.spacing.lg,
    height: 4,
    width: 160,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '66%',
    backgroundColor: theme.colors.primary,
  },
});

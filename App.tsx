import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ProfileProvider, TasksProvider, useProfile } from './src/lib/hooks';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppBackground } from './src/components/ui/AppBackground';
import { theme } from './src/styles/theme';

const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
TextWithDefaults.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextWithDefaults.defaultProps.style];

function AppShell() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <Text style={styles.logoText}>FlowPilot</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </AppBackground>
    );
  }

  return <RootNavigator initialRouteName="Splash" />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <AppBackground>
        <View style={styles.centered}>
          <Text style={styles.logoText}>FlowPilot</Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <TasksProvider>
          <NavigationContainer>
            <AppShell />
          </NavigationContainer>
        </TasksProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 24,
  },
  progressTrack: {
    marginTop: theme.spacing.md,
    height: 4,
    width: 128,
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

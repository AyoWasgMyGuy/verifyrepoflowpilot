import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { FocusProvider, ProfileProvider, TasksProvider, useProfile } from './src/lib/hooks';
import { ToastProvider } from './src/lib/toast';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Screen } from './src/components/Screen';
import { theme } from './src/styles/theme';

const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
TextWithDefaults.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextWithDefaults.defaultProps.style];

function AppShell() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.logoText}>FlowPilot</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </Screen>
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
      <Screen style={styles.centered}>
        <Text style={styles.logoText}>FlowPilot</Text>
      </Screen>
    );
  }

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <TasksProvider>
          <FocusProvider>
            <ToastProvider>
              <NavigationContainer>
                <AppShell />
              </NavigationContainer>
            </ToastProvider>
          </FocusProvider>
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

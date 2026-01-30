import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from './AppBackground';

type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
};

export function Screen({ children, style, scroll }: ScreenProps) {
  if (scroll) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContainer, style]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={[styles.safeArea, style]}>{children}</SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
});

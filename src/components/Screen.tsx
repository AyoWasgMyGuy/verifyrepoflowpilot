import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

type ScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: ScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.bgWash} />
      <View style={styles.bgOrb} />
      <SafeAreaView style={[styles.content, style]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  bgWash: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.surfaceAlt,
    opacity: 0.6,
  },
  bgOrb: {
    position: 'absolute',
    bottom: -140,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: theme.colors.accent,
    opacity: 0.25,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

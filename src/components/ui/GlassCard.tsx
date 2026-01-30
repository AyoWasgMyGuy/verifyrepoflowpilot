import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../styles/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function GlassCard({ children, style }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={24} tint="dark" style={[styles.card, style]}>
        {children}
      </BlurView>
    );
  }

  return <View style={[styles.card, styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    // RGBA keeps the glass effect consistent across platforms.
    backgroundColor: 'rgba(28,46,46,0.8)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
  fallback: {
    backgroundColor: 'rgba(28,46,46,0.9)',
  },
});

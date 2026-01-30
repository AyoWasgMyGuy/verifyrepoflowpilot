import React from 'react';
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

type ActionChipVariant = 'primary' | 'neutral' | 'accent';

type ActionChipProps = {
  label: string;
  onPress?: () => void;
  variant?: ActionChipVariant;
  style?: StyleProp<ViewStyle>;
};

const variants: Record<ActionChipVariant, { bg: string; border: string; text: string }> = {
  primary: {
    bg: 'rgba(19,236,236,0.18)',
    border: 'rgba(19,236,236,0.35)',
    text: theme.colors.primary,
  },
  neutral: {
    bg: theme.colors.surfaceAlt,
    border: theme.colors.border,
    text: theme.colors.textMuted,
  },
  accent: {
    bg: 'rgba(139,92,246,0.18)',
    border: 'rgba(139,92,246,0.35)',
    text: theme.colors.accent,
  },
};

export function ActionChip({ label, onPress, variant = 'neutral', style }: ActionChipProps) {
  const visuals = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: visuals.bg, borderColor: visuals.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, { color: visuals.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});

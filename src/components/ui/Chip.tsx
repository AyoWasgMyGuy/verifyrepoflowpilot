import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

type ChipVariant = 'primary' | 'danger' | 'warning' | 'info' | 'success' | 'neutral';

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  onPress?: () => void;
  style?: ViewStyle;
};

const variantStyles: Record<ChipVariant, { backgroundColor: string; borderColor: string; color: string }> = {
  primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, color: theme.colors.bg },
  danger: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger, color: theme.colors.bg },
  warning: { backgroundColor: theme.colors.warning, borderColor: theme.colors.warning, color: theme.colors.bg },
  info: { backgroundColor: theme.colors.info, borderColor: theme.colors.info, color: theme.colors.bg },
  success: { backgroundColor: theme.colors.success, borderColor: theme.colors.success, color: theme.colors.bg },
  neutral: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border, color: theme.colors.text },
};

export function Chip({ label, variant = 'neutral', onPress, style }: ChipProps) {
  const visuals = variantStyles[variant];
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: visuals.backgroundColor,
          borderColor: visuals.borderColor,
        },
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: visuals.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.text.small,
    fontFamily: theme.fonts.body,
  },
  pressed: {
    opacity: 0.85,
  },
});

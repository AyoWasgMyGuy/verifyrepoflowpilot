import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles.primary, pressed && styles.pressed, style]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles.secondary, pressed && styles.pressed, style]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'rgba(28,46,46,0.7)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  secondaryText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  pressed: {
    opacity: 0.85,
  },
});

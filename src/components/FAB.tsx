import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

type FABProps = {
  onPress: () => void;
  style?: ViewStyle;
};

export function FAB({ onPress, style }: FABProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.pressed, style]}>
      <Text style={styles.label}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xxl,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  label: {
    fontSize: 30,
    fontFamily: theme.fonts.display,
    color: theme.colors.bg,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});

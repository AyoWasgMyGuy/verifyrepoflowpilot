import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

type IconButtonProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
};

export function IconButton({ icon, onPress, size = 40, style }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
});

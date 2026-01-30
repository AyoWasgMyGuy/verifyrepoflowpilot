import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';

type BottomActionDockProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function BottomActionDock({ children, style }: BottomActionDockProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
});

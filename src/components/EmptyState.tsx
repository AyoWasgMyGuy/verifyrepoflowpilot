import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.text.headline,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.text.body,
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
  },
});

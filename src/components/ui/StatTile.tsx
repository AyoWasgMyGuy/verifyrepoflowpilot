import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../styles/theme';
import { GlassCard } from './GlassCard';

type StatTileProps = {
  label: string;
  value: string;
  icon?: string;
};

export function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon ?? ''}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  icon: {
    fontSize: 12,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  value: {
    fontSize: theme.text.headline,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.text.small,
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SurfaceCard } from './SurfaceCard';
import { theme } from '../styles/theme';

type StatTileProps = {
  label: string;
  value: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
};

export function StatTile({ label, value, iconName, iconColor = theme.colors.textMuted }: StatTileProps) {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.iconWrap}>
        {iconName ? <Ionicons name={iconName} size={18} color={iconColor} /> : <Text style={styles.iconText} />}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </SurfaceCard>
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
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  value: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
});

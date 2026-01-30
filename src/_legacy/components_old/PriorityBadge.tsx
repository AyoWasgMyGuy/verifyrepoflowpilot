import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

type PriorityLevel = 'high' | 'medium' | 'low';

type PriorityBadgeProps = {
  level: PriorityLevel;
  style?: StyleProp<ViewStyle>;
};

const palette: Record<PriorityLevel, { bg: string; border: string; text: string; label: string }> = {
  high: {
    bg: 'rgba(251,146,60,0.18)',
    border: 'rgba(251,146,60,0.4)',
    text: '#FB923C',
    label: 'HIGH',
  },
  medium: {
    bg: 'rgba(250,204,21,0.18)',
    border: 'rgba(250,204,21,0.4)',
    text: '#FACC15',
    label: 'MED',
  },
  low: {
    bg: 'rgba(96,165,250,0.18)',
    border: 'rgba(96,165,250,0.4)',
    text: '#60A5FA',
    label: 'LOW',
  },
};

export function PriorityBadge({ level, style }: PriorityBadgeProps) {
  const meta = palette[level];
  return (
    <View style={[styles.base, { backgroundColor: meta.bg, borderColor: meta.border }, style]}>
      <Text style={[styles.text, { color: meta.text }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  text: {
    fontFamily: theme.fonts.display,
    fontSize: 11,
  },
});

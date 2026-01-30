import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../styles/theme';

type BrainDumpCTAProps = {
  onPress: () => void;
};

export function BrainDumpCTA({ onPress }: BrainDumpCTAProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.brainDump, pressed && styles.pressed]}>
      <View style={styles.brainDumpTextBlock}>
        <Text style={styles.brainDumpTitle}>Brain Dump</Text>
        <Text style={styles.brainDumpSubtitle}>Capture everything in one calm sweep.</Text>
      </View>
      <View style={styles.brainDumpIcon}>
        <Text style={styles.brainDumpIconText}>+</Text>
      </View>
    </Pressable>
  );
}

export function SmallPlusFAB({ onPress }: BrainDumpCTAProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Text style={styles.fabText}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brainDump: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  brainDumpTextBlock: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  brainDumpTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  brainDumpSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 4,
  },
  brainDumpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  brainDumpIconText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 22,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 96,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  fabText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 24,
  },
  pressed: {
    opacity: 0.85,
  },
});

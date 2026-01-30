import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../styles/theme';
import { Chip } from './Chip';

type TaskRowProps = {
  title: string;
  subtitle?: string;
  priorityLabel: string;
  priorityVariant?: React.ComponentProps<typeof Chip>['variant'];
  done?: boolean;
  onPress?: () => void;
  footerChips?: React.ReactNode;
};

export function TaskRow({
  title,
  subtitle,
  priorityLabel,
  priorityVariant = 'neutral',
  done,
  onPress,
  footerChips,
}: TaskRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.checkWrap}>
        <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
          {done ? <View style={styles.checkDot} /> : null}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.chipRow}>
          <Chip label={priorityLabel} variant={priorityVariant} />
          {footerChips}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  checkWrap: {
    paddingTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    borderColor: theme.colors.primary,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  body: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  titleDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PriorityBadge } from './PriorityBadge';
import { theme } from '../styles/theme';

type PriorityLevel = 'high' | 'medium' | 'low';

type TaskRowProps = {
  title: string;
  subtitle?: string;
  priority?: PriorityLevel;
  done?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
  toggleTestID?: string;
};

export function TaskRow({ title, subtitle, priority = 'medium', done, onPress, onToggle, toggleTestID }: TaskRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Pressable onPress={onToggle} style={styles.checkWrap} hitSlop={8} testID={toggleTestID}>
        <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
          {done ? <View style={styles.checkDot} /> : null}
        </View>
      </Pressable>
      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <PriorityBadge level={priority} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  checkWrap: {
    paddingTop: 2,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  pressed: {
    opacity: 0.85,
  },
});

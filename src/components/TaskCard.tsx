import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../lib/repo';
import { theme } from '../styles/theme';
import { Card } from './Card';

type TaskCardProps = {
  task: Task;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function TaskCard({ task, onPress, children }: TaskCardProps) {
  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>P{task.priority}</Text>
        </View>
      </View>
      {(task.estimateMinutes || task.dueAt) && (
        <View style={styles.metaRow}>
          {task.estimateMinutes ? (
            <Text style={styles.metaText}>{task.estimateMinutes} min</Text>
          ) : null}
          {task.dueAt ? <Text style={styles.metaText}>Due {task.dueAt}</Text> : null}
        </View>
      )}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {},
  card: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: theme.text.headline,
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
  },
  priorityBadge: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  priorityText: {
    fontSize: theme.text.small,
    color: theme.colors.primary,
    fontFamily: theme.fonts.body,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metaText: {
    fontSize: theme.text.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
  },
  actions: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});

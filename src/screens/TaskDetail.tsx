import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomActionDock } from '../components/ui/BottomActionDock';
import { Chip } from '../components/ui/Chip';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { Screen } from '../components/ui/Screen';
import { useTasks } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ navigation, route }: Props) {
  const { tasks, setStatus } = useTasks();
  const task = tasks.find((item) => item.id === route.params.taskId);

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <Text style={styles.title}>Task not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.tagRow}>
            <Chip label={task.status.toUpperCase()} />
            <Chip label={`P${task.priority}`} variant="primary" />
            <Chip label="Work" variant="info" />
          </View>
          <Text style={styles.heroTitle}>{task.title}</Text>
          <Text style={styles.heroMeta}>{task.dueAt ? `Due ${task.dueAt}` : 'No due date'}</Text>
          {task.estimateMinutes ? (
            <Text style={styles.heroMeta}>{task.estimateMinutes} min estimate</Text>
          ) : null}
        </GlassCard>

        <View style={styles.sectionList}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.sectionText}>Add details once you're ready.</Text>
          </GlassCard>
          <GlassCard>
            <Text style={styles.sectionTitle}>Checklist</Text>
            <Text style={styles.sectionText}>Break the task into calm steps.</Text>
          </GlassCard>
          <GlassCard>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Text style={styles.sectionText}>Last updated {new Date(task.updatedAt).toLocaleDateString()}</Text>
          </GlassCard>
        </View>
      </View>

      <BottomActionDock style={styles.dock}>
        <View style={styles.dockRow}>
          <PrimaryButton
            label="Start Focus"
            onPress={() => navigation.navigate('Tabs', { screen: 'Focus', params: { taskId: task.id } })}
            style={styles.flex}
          />
          <SecondaryButton label="Done" onPress={() => setStatus(task.id, 'done')} style={styles.flex} />
        </View>
        <SecondaryButton label="Archive" onPress={() => setStatus(task.id, 'archived')} style={styles.archiveButton} />
      </BottomActionDock>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 140,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
  },
  heroCard: {
    gap: theme.spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  heroTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  heroMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  sectionList: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  sectionText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 6,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dockRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  flex: {
    flex: 1,
  },
  archiveButton: {
    marginTop: theme.spacing.sm,
  },
});

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { TaskRow } from '../components/TaskRow';
import { useTasks } from '../lib/hooks';
import { clampPriority, priorityToLevel } from '../lib/priority';
import { Task } from '../lib/repo';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import { useToast } from '../lib/toast';

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    const dueA = a.dueAt ?? '';
    const dueB = b.dueAt ?? '';
    if (dueA && dueB && dueA !== dueB) {
      return dueA.localeCompare(dueB);
    }
    if (dueA && !dueB) {
      return -1;
    }
    if (!dueA && dueB) {
      return 1;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function TodayListScreen() {
  const { tasks, setStatus, updateTask } = useTasks();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();

  const todayTasks = useMemo(() => {
    const openToday = tasks.filter((task) => task.status === 'today');
    return sortTasks(openToday);
  }, [tasks]);

  return (
    <Screen>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.subtitle}>All tasks scheduled for today.</Text>
          </View>

          {todayTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for today.</Text>
          ) : (
            <View style={styles.list}>
              {todayTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  subtitle={task.notes || 'No description'}
                  priority={priorityToLevel(clampPriority(task.priority))}
                  done={false}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  onToggle={() => {
                    const snapshot = {
                      id: task.id,
                      prevStatus: task.status,
                      prevCompletedAt: task.completedAt,
                      prevCompletedFrom: task.completedFrom,
                    };
                    const baseTask = { ...task };
                    setStatus(task.id, 'done');
                    showToast({
                      message: 'Marked done',
                      actionLabel: 'Undo',
                      durationMs: 5000,
                      onAction: () => {
                        updateTask({
                          ...baseTask,
                          status: snapshot.prevStatus,
                          completedAt: snapshot.prevCompletedAt,
                          completedFrom: snapshot.prevCompletedFrom,
                        });
                      },
                    });
                  }}
                  toggleTestID={`task-toggle-${task.id}`}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 160,
  },
  header: {
    marginBottom: theme.spacing.lg,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  list: {
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});

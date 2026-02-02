import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { TaskRow } from '../components/TaskRow';
import { useTasks } from '../lib/hooks';
import { clampPriority, priorityToLevel } from '../lib/priority';
import { Task } from '../lib/repo';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import { useToast } from '../lib/toast';
import { isCompletedToday } from '../lib/day';

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
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const { todayTasks, completedToday } = useMemo(() => {
    const openToday = tasks.filter((task) => task.status === 'today');
    const completed = tasks.filter(isCompletedToday).sort((a, b) => {
      const aTime = a.completedAt ?? '';
      const bTime = b.completedAt ?? '';
      return bTime.localeCompare(aTime);
    });
    return { todayTasks: sortTasks(openToday), completedToday: completed };
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

          {completedToday.length > 0 ? (
            <View>
              <View style={styles.sectionHeader}>
                <Pressable
                  style={styles.completedTitleWrap}
                  onPress={() => setCompletedExpanded((prev) => !prev)}
                  testID="completed-header-list"
                  hitSlop={8}
                >
                  <Text style={styles.completedTitle} numberOfLines={1}>
                    Completed ({completedToday.length})
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.completedChevron}
                  onPress={() => setCompletedExpanded((prev) => !prev)}
                  hitSlop={6}
                >
                  <Ionicons
                    name={completedExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              </View>
              {completedExpanded ? (
                <View style={styles.list} testID="completed-list-list">
                  {completedToday.map((task) => (
                    <TaskRow
                      key={task.id}
                      title={task.title}
                      subtitle={task.notes || 'No description'}
                      priority={priorityToLevel(clampPriority(task.priority))}
                      done
                      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                      onToggle={() => setStatus(task.id, 'today')}
                      toggleTestID={`completed-toggle-${task.id}`}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
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
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedTitleWrap: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  completedTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
    flexShrink: 1,
  },
  completedChevron: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
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


import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { SurfaceCard } from '../components/SurfaceCard';
import { TaskRow } from '../components/TaskRow';
import { useBrainDump } from '../lib/brainDump';
import { useProfile, useTasks } from '../lib/hooks';
import { useFloatingBottomOffset } from '../lib/layout';
import { clampPriority, priorityToLevel } from '../lib/priority';
import { Task } from '../lib/repo';
import { useToast } from '../lib/toast';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Today'>;

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

export function TodayScreen({ navigation }: Props) {
  const { tasks, setStatus, updateTask } = useTasks();
  const { profile } = useProfile();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openBrainDump } = useBrainDump();
  const floatingOffset = useFloatingBottomOffset();
  const { showToast } = useToast();

  const { topTasks, completedTodayCount, plannedTodayCount, remainingTodayCount } = useMemo(() => {
    const active = tasks.filter((task) => task.status !== 'archived');
    const todayOpen = active.filter((task) => task.status === 'today');
    const sorted = sortTasks(todayOpen);
    const todayKey = new Date().toDateString();
    const completedToday = active.filter(
      (task) =>
        task.status === 'done' &&
        task.completedFrom === 'today' &&
        task.completedAt &&
        new Date(task.completedAt).toDateString() === todayKey
    );
    const plannedToday = todayOpen.length + completedToday.length;
    return {
      topTasks: sorted.slice(0, 3),
      completedTodayCount: completedToday.length,
      plannedTodayCount: plannedToday,
      remainingTodayCount: todayOpen.length,
    };
  }, [tasks]);

  const name = profile?.displayName ?? 'Guest';
  const progress = plannedTodayCount > 0 ? completedTodayCount / plannedTodayCount : 0;
  const fabBottom = floatingOffset;
  const scrollPaddingBottom = floatingOffset + 140;

  return (
    <Screen>
      <View style={styles.root} testID="screen-today">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
        >
          <View style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={22} color={theme.colors.text} />
                  </View>
                  <View style={styles.avatarDot} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.greeting}>Hello, {name} 👋</Text>
                  <Text style={styles.subtitle}>Let's find your flow.</Text>
                </View>
              </View>
              <Pressable style={styles.notificationButton} onPress={() => navigation.navigate('Settings')}>
                <Ionicons name="notifications" size={20} color={theme.colors.text} />
                <View style={styles.notificationDot} />
              </Pressable>
            </View>

            <SurfaceCard style={styles.statsCard}>
              <View style={styles.statsGlow} />
              <View style={styles.statsRow}>
                <View style={styles.statsText}>
                  <Text style={styles.statsLabel}>TODAY PROGRESS</Text>
                  <View style={styles.statsCountRow}>
                <Text style={styles.statsCount}>{completedTodayCount}</Text>
                <Text style={styles.statsTotal}>/ {plannedTodayCount} tasks</Text>
                  </View>
                  <Text style={styles.statsHint}>Keep it moving.</Text>
                </View>
                <View style={styles.ringWrap}>
                  <ProgressRing progress={progress} size={96} strokeWidth={8} trackColor={theme.colors.surfaceAlt} />
                  <Ionicons name="checkmark-circle" size={32} color={theme.colors.primary} style={styles.ringIcon} />
                </View>
              </View>
            </SurfaceCard>

        <View style={styles.miniStatsRow}>
          <StatTile label="Total" value={`${plannedTodayCount}`} iconName="list" />
          <StatTile label="Done" value={`${completedTodayCount}`} iconName="checkmark-done" iconColor={theme.colors.primary} />
          <StatTile label="Focus" value="45m" iconName="timer" iconColor={theme.colors.accent} />
        </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Tasks</Text>
              <Pressable onPress={() => rootNavigation.navigate('TodayList')}>
                <Text style={styles.sectionAction}>
                  View all{remainingTodayCount > 0 ? ` (${remainingTodayCount})` : ''}
                </Text>
              </Pressable>
            </View>

            <View style={styles.taskList}>
              {topTasks.length === 0 ? (
                <Text style={styles.emptyText}>No tasks for today. Enjoy the calm!</Text>
              ) : (
                topTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      title={task.title}
                      subtitle={task.notes || 'No description'}
                      priority={priorityToLevel(clampPriority(task.priority))}
                      done={task.status === 'done'}
                      onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
                      onToggle={() => {
                        if (task.status === 'done') {
                          setStatus(task.id, 'today');
                          return;
                        }
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
                  ))
              )}
            </View>
          </View>
        </ScrollView>

        <Pressable style={[styles.fab, { bottom: fabBottom }]} onPress={openBrainDump} testID="open-brain-dump">
          <Ionicons name="sparkles" size={22} color={theme.colors.bg} />
          <Text style={styles.fabText}>AI Assistant</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
  headerText: {
    flexDirection: 'column',
  },
  greeting: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 20,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  statsCard: {
    overflow: 'hidden',
  },
  statsGlow: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(19,236,236,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  statsText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statsLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  statsCountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  statsCount: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 36,
  },
  statsTotal: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 16,
  },
  statsHint: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  ringWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIcon: {
    position: 'absolute',
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  sectionAction: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskList: {
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    zIndex: 100,
  },
  fabText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.small,
  },
});

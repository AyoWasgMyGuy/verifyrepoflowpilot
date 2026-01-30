import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { SurfaceCard } from '../components/SurfaceCard';
import { TaskRow } from '../components/TaskRow';
import { useProfile, useTasks } from '../lib/hooks';
import { Task } from '../lib/repo';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Today'>;

type PriorityLevel = 'high' | 'medium' | 'low';

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

function priorityLevel(priority: number): PriorityLevel {
  if (priority >= 4) return 'high';
  if (priority === 3) return 'medium';
  return 'low';
}

export function TodayScreen({ navigation }: Props) {
  const { tasks, setStatus } = useTasks();
  const { profile } = useProfile();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { topTasks, doneCount, totalCount } = useMemo(() => {
    const active = tasks.filter((task) => task.status !== 'archived');
    const sorted = sortTasks(active.filter((task) => task.status !== 'done'));
    const done = tasks.filter((task) => task.status === 'done').length;
    const total = tasks.filter((task) => task.status !== 'archived').length;
    return {
      topTasks: sorted.slice(0, 3),
      doneCount: done,
      totalCount: total,
    };
  }, [tasks]);

  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const name = profile?.displayName ?? 'Guest';

  return (
    <Screen scroll>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={theme.colors.text} />
            </View>
            <View style={styles.avatarDot} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello, {name} ??</Text>
            <Text style={styles.subtitle}>Let's find your flow.</Text>
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
              <Text style={styles.statsLabel}>PRIORITY PROGRESS</Text>
              <View style={styles.statsCountRow}>
                <Text style={styles.statsCount}>{doneCount}</Text>
                <Text style={styles.statsTotal}>/ {totalCount} tasks</Text>
              </View>
              <Text style={styles.statsHint}>Keep the momentum!</Text>
            </View>
            <View style={styles.ringWrap}>
              <ProgressRing progress={progress} size={96} strokeWidth={8} trackColor={theme.colors.surfaceAlt} />
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.primary} style={styles.ringIcon} />
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.miniStatsRow}>
          <StatTile label="Total" value={`${totalCount}`} iconName="list" />
          <StatTile label="Done" value={`${doneCount}`} iconName="checkmark-done" iconColor={theme.colors.primary} />
          <StatTile label="Focus" value="45m" iconName="timer" iconColor={theme.colors.accent} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Tasks</Text>
          <Pressable onPress={() => navigation.navigate('Inbox')}>
            <Text style={styles.sectionAction}>View All</Text>
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
                priority={priorityLevel(task.priority)}
                done={task.status === 'done'}
                onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
                onToggle={() => setStatus(task.id, task.status === 'done' ? 'today' : 'done')}
              />
            ))
          )}
        </View>
      </View>

      <Pressable style={styles.fab} onPress={() => rootNavigation.navigate('BrainDump')}>
        <Ionicons name="sparkles" size={20} color={theme.colors.bg} />
        <Text style={styles.fabText}>AI Assistant</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 180,
    gap: theme.spacing.lg,
  },
  header: {
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
    flex: 1,
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
    borderColor: 'rgba(255,255,255,0.08)',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
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
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(19,236,236,0.12)',
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
    fontSize: 11,
    letterSpacing: 1,
  },
  taskList: {
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  fabText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.small,
  },
});

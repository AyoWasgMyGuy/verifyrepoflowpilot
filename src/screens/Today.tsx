import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/ui/AppHeader';
import { BrainDumpCTA } from '../components/ui/FABs';
import { GlassCard } from '../components/ui/GlassCard';
import { Screen } from '../components/ui/Screen';
import { StatTile } from '../components/ui/StatTile';
import { TaskRow } from '../components/ui/TaskRow';
import { PrimaryButton } from '../components/ui/Buttons';
import { useProfile, useTasks } from '../lib/hooks';
import { Task } from '../lib/repo';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Today'>;

type PriorityVariant = 'danger' | 'warning' | 'info' | 'neutral';

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

function priorityVariant(priority: number): PriorityVariant {
  if (priority >= 4) return 'danger';
  if (priority === 3) return 'warning';
  if (priority === 2) return 'info';
  return 'neutral';
}

const timeSlots = ['09:00', '11:00', '14:00', '16:00'];

export function TodayScreen({ navigation }: Props) {
  const { tasks } = useTasks();
  const { profile } = useProfile();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showSuggestion, setShowSuggestion] = useState(true);

  const { topPriority, doneCount, totalCount, focusMinutes, scheduledBlocks, unscheduledTasks } = useMemo(() => {
    const active = tasks.filter((task) => task.status !== 'archived');
    const sorted = sortTasks(active.filter((task) => task.status !== 'done'));
    const done = tasks.filter((task) => task.status === 'done').length;
    const total = tasks.filter((task) => task.status !== 'archived').length;
    const minutes = active.reduce((sum, task) => sum + (task.estimateMinutes ?? 0), 0);
    const top = sorted.slice(0, 3);
    const scheduled = top.map((task, index) => ({ time: timeSlots[index] ?? '18:00', task }));
    return {
      topPriority: top,
      doneCount: done,
      totalCount: total,
      focusMinutes: minutes,
      scheduledBlocks: scheduled,
      unscheduledTasks: sorted.slice(3, 6),
    };
  }, [tasks]);

  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const name = profile?.displayName ?? 'Guest';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen scroll>
      <View style={styles.page}>
        <AppHeader
          title={`Hi ${name}`}
          subtitle={`${formattedDate} · ${doneCount}/${totalCount} done`}
          rightIcon="notifications-outline"
          onRightPress={() => navigation.navigate('Settings')}
        />

        <Pressable style={styles.captureBar} onPress={() => rootNavigation.navigate('BrainDump')}>
          <Text style={styles.captureText}>Dump what's on your mind...</Text>
          <View style={styles.captureIcons}>
            <Ionicons name="mic" size={18} color={theme.colors.textMuted} />
            <View style={styles.captureArrow}>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.bg} />
            </View>
          </View>
        </Pressable>

        <GlassCard style={styles.priorityCard}>
          <View style={styles.priorityHeader}>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityBadgeText}>{topPriority.length}</Text>
            </View>
            <Text style={styles.sectionTitle}>Top Priority</Text>
          </View>
          <View style={styles.priorityList}>
            {topPriority.length === 0 ? (
              <Text style={styles.mutedText}>No priority tasks yet.</Text>
            ) : (
              topPriority.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  subtitle={task.dueAt ? `Due ${task.dueAt}` : 'No due date'}
                  priorityLabel={`P${task.priority}`}
                  priorityVariant={priorityVariant(task.priority)}
                  done={task.status === 'done'}
                  onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
                />
              ))
            )}
          </View>
          <PrimaryButton
            label="Start Focus Session"
            onPress={() => {
              if (topPriority[0]) {
                navigation.navigate('Focus', { taskId: topPriority[0].id });
              }
            }}
            style={styles.focusButton}
          />
        </GlassCard>

        {showSuggestion ? (
          <GlassCard style={styles.suggestionCard}>
            <View style={styles.suggestionRow}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
              <View style={styles.suggestionTextBlock}>
                <Text style={styles.suggestionTitle}>Suggested next</Text>
                <Text style={styles.suggestionText}>Review the top priority item while energy is high.</Text>
              </View>
              <Pressable onPress={() => setShowSuggestion(false)}>
                <Ionicons name="close" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <Pressable style={styles.suggestionAction} onPress={() => navigation.navigate('Focus')}>
              <Text style={styles.suggestionActionText}>Start now</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          <Pressable onPress={() => navigation.navigate('Plan')}>
            <Text style={styles.linkText}>Edit plan</Text>
          </Pressable>
        </View>

        <View style={styles.scheduleList}>
          {scheduledBlocks.map((block) => (
            <View key={block.time} style={styles.scheduleRow}>
              <Text style={styles.scheduleTime}>{block.time}</Text>
              <View style={styles.scheduleCard}>
                <TaskRow
                  title={block.task.title}
                  subtitle={block.task.dueAt ? `Due ${block.task.dueAt}` : 'No due date'}
                  priorityLabel={`P${block.task.priority}`}
                  priorityVariant={priorityVariant(block.task.priority)}
                  done={block.task.status === 'done'}
                  onPress={() => rootNavigation.navigate('TaskDetail', { taskId: block.task.id })}
                />
              </View>
            </View>
          ))}
        </View>

        {unscheduledTasks.length > 0 ? (
          <View style={styles.unscheduledSection}>
            <Text style={styles.mutedText}>Unscheduled</Text>
            <GlassCard style={styles.unscheduledCard}>
              {unscheduledTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  subtitle={task.dueAt ? `Due ${task.dueAt}` : 'No due date'}
                  priorityLabel={`P${task.priority}`}
                  priorityVariant={priorityVariant(task.priority)}
                  done={task.status === 'done'}
                  onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
                />
              ))}
            </GlassCard>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickGrid}>
          {[
            { icon: 'brain', label: 'Brain Dump', action: () => rootNavigation.navigate('BrainDump'), tone: theme.colors.primary },
            { icon: 'add', label: 'Add Task', action: () => navigation.navigate('Inbox'), tone: theme.colors.text },
            { icon: 'calendar', label: 'Plan Day', action: () => navigation.navigate('Plan'), tone: theme.colors.text },
            { icon: 'play', label: 'Start Focus', action: () => navigation.navigate('Focus'), tone: theme.colors.text },
          ].map((item) => (
            <Pressable key={item.label} style={styles.quickTile} onPress={item.action}>
              <View style={[styles.quickIcon, item.tone === theme.colors.primary && styles.quickIconPrimary]}>
                <Ionicons name={item.icon as any} size={18} color={item.tone} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stats Summary</Text>
        </View>
        <View style={styles.statsRow}>
          <StatTile icon="?" value={`${doneCount}`} label="Completed" />
          <StatTile icon="?" value={`${Math.round(focusMinutes / 60)}h`} label="Planned" />
          <StatTile icon="?" value="5" label="Day streak" />
        </View>

        <View style={styles.brainDumpCta}>
          <BrainDumpCTA onPress={() => rootNavigation.navigate('BrainDump')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 140,
  },
  captureBar: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  captureText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.body,
  },
  captureIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  captureArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityCard: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priorityBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadgeText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  priorityList: {
    gap: theme.spacing.sm,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  focusButton: {
    marginTop: theme.spacing.sm,
  },
  suggestionCard: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  suggestionTextBlock: {
    flex: 1,
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  suggestionText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 2,
  },
  suggestionAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  suggestionActionText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  scheduleList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  scheduleTime: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    width: 58,
    paddingTop: 8,
  },
  scheduleCard: {
    flex: 1,
  },
  unscheduledSection: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  unscheduledCard: {
    gap: theme.spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickTile: {
    width: '47%',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconPrimary: {
    backgroundColor: 'rgba(19,236,236,0.12)',
    borderColor: 'rgba(19,236,236,0.25)',
  },
  quickLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.small,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  brainDumpCta: {
    marginBottom: theme.spacing.lg,
  },
});

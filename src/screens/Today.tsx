import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressRing } from '../components/ProgressRing';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { SurfaceCard } from '../components/SurfaceCard';
import { TaskRow } from '../components/TaskRow';
import { useBrainDump } from '../lib/brainDump';
import { useProfile, useTasks } from '../lib/hooks';
import { Task } from '../lib/repo';
import { useToast } from '../lib/toast';
import { isCompletedToday } from '../lib/day';
import { clearReviewDraft, formatSavedAgo, loadReviewDraft } from '../lib/reviewDraft';
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
  const { tasks, setStatus, updateTask } = useTasks();
  const { profile } = useProfile();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openBrainDump } = useBrainDump();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ count: number; savedAt: number } | null>(null);
  const [draftDiscardOpen, setDraftDiscardOpen] = useState(false);

  const { topTasks, doneCount, totalCount, completedToday } = useMemo(() => {
    const openToday = tasks.filter((task) => task.status === 'today');
    const sorted = sortTasks(openToday);
    const completed = tasks
      .filter(isCompletedToday)
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    const done = completed.length;
    const total = openToday.length + done;
    return {
      topTasks: sorted.slice(0, 3),
      doneCount: done,
      totalCount: total,
      completedToday: completed,
    };
  }, [tasks]);

  const refreshDraftBanner = useCallback(async () => {
    const stored = await loadReviewDraft();
    if (stored?.drafts?.length) {
      setDraftInfo({ count: stored.drafts.length, savedAt: stored.savedAt });
    } else {
      setDraftInfo(null);
    }
  }, []);

  useEffect(() => {
    refreshDraftBanner();
  }, [refreshDraftBanner]);

  useFocusEffect(
    useCallback(() => {
      refreshDraftBanner();
    }, [refreshDraftBanner])
  );

  const name = profile?.displayName ?? 'Guest';
  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const fabBottom = insets.bottom + 96;
  const scrollPaddingBottom = insets.bottom + 140;

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

            {draftInfo ? (
              <SurfaceCard style={styles.draftBanner} testID="draft-banner">
                <View style={styles.draftBannerContent}>
                  <View style={styles.draftBannerText}>
                    <Text style={styles.draftBannerTitle}>Draft</Text>
                    <Text style={styles.draftBannerSubtitle}>
                      {draftInfo.count} tasks • {formatSavedAgo(draftInfo.savedAt)}
                    </Text>
                  </View>
                  <View style={styles.draftBannerActions}>
                    <Pressable
                      style={styles.draftButtonPrimary}
                      onPress={() => rootNavigation.navigate('Review', { openSavedDraft: true })}
                    >
                      <Text style={styles.draftButtonPrimaryText}>Review</Text>
                    </Pressable>
                    <Pressable
                      style={styles.draftButtonSecondary}
                      onPress={() => setDraftDiscardOpen(true)}
                      testID="draft-discard"
                    >
                      <Text style={styles.draftButtonSecondaryText}>Discard</Text>
                    </Pressable>
                  </View>
                </View>
              </SurfaceCard>
            ) : null}

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

            {completedToday.length > 0 ? (
              <View>
                <View style={styles.completedHeaderRow}>
                  <Pressable
                    style={styles.completedHeaderPressable}
                    onPress={() => setCompletedExpanded((prev) => !prev)}
                    testID="completed-header"
                    hitSlop={8}
                  >
                    <Text style={styles.completedHeaderText} numberOfLines={1}>
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
                  <View style={styles.taskList} testID="completed-list">
                    {completedToday.map((task) => (
                      <TaskRow
                        key={task.id}
                        title={task.title}
                        subtitle={task.notes || 'No description'}
                        priority={priorityLevel(task.priority)}
                        done
                        onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
                        onToggle={() => setStatus(task.id, 'today')}
                        toggleTestID={`completed-toggle-${task.id}`}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <Pressable style={[styles.fab, { bottom: fabBottom }]} onPress={openBrainDump} testID="open-brain-dump">
          <Ionicons name="sparkles" size={22} color={theme.colors.bg} />
          <Text style={styles.fabText}>AI Assistant</Text>
        </Pressable>
      </View>

      {draftDiscardOpen ? (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDraftDiscardOpen(false)} />
          <SurfaceCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Discard draft?</Text>
            <Text style={styles.modalSubtitle}>This clears your saved review draft.</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButtonSecondary} onPress={() => setDraftDiscardOpen(false)}>
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtonDanger}
                onPress={async () => {
                  await clearReviewDraft();
                  setDraftInfo(null);
                  setDraftDiscardOpen(false);
                  showToast({ message: 'Draft discarded' });
                }}
                testID="draft-discard-confirm"
              >
                <Text style={styles.modalButtonDangerText}>Discard</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        </View>
      ) : null}
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
  draftBanner: {
    padding: theme.spacing.lg,
  },
  draftBannerContent: {
    gap: theme.spacing.md,
  },
  draftBannerText: {
    gap: 4,
  },
  draftBannerTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  draftBannerSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  draftBannerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  draftButtonPrimary: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  draftButtonPrimaryText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  draftButtonSecondary: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  draftButtonSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
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
  completedHeaderRow: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedHeaderPressable: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  completedHeaderText: {
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  modalSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalButtonSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  modalButtonDanger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  modalButtonDangerText: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFloatingBottomOffset } from '../lib/layout';
import { IconCircleButton } from '../components/IconCircleButton';
import { PriorityBadge } from '../components/PriorityBadge';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { formatDuration } from '../lib/duration';
import { useToast } from '../lib/toast';
import { clampPriority, priorityToLevel } from '../lib/priority';
import { filterTasks, getCategoryCounts, sortTasks, type CategoryFilter, type SortMode } from '../lib/taskFilters';
import { getCategoryLabel, categoryOptions, type CategoryKey } from '../lib/categories';
import { validateIsoDate } from '../lib/dueDate';
import { loadInboxViewPrefs, saveInboxViewPrefs } from '../lib/inboxViewPrefs';
import { Task } from '../lib/repo';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const { tasks, setStatus, addTasks, updateTask } = useTasks();
  const { showToast } = useToast();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const floatingOffset = useFloatingBottomOffset();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryKey>('general');
  const [newDueAt, setNewDueAt] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [showControls, setShowControls] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inboxTasks = useMemo(() => tasks.filter((task) => task.status === 'inbox'), [tasks]);
  const categoryCounts = useMemo(() => getCategoryCounts(inboxTasks, searchQuery), [inboxTasks, searchQuery]);
  const filteredTasks = useMemo(
    () => sortTasks(filterTasks(inboxTasks, searchQuery, category), sortMode),
    [inboxTasks, searchQuery, category, sortMode]
  );

  const fabBottom = floatingOffset;
  const scrollPaddingBottom = floatingOffset + 140;

  useEffect(() => {
    let active = true;
    loadInboxViewPrefs().then((prefs) => {
      if (!active) return;
      setSortMode(prefs.sortMode);
      setCategory(prefs.category);
      setPrefsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveInboxViewPrefs({ sortMode, category });
    }, 250);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sortMode, category, prefsLoaded]);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const dueAtValue = newDueAt.trim();
    const dueAt = dueAtValue && validateIsoDate(dueAtValue) ? dueAtValue : null;
    const categoryValue = newCategory === 'general' ? null : newCategory;
    await addTasks([
      {
        title,
        notes: '',
        priority: 2,
        estimateMinutes: 30,
        status: 'inbox',
        dueAt,
        category: categoryValue,
      },
    ]);
    setNewTitle('');
    setNewDueAt('');
    setNewCategory('general');
    setIsAddOpen(false);
  };

  const presetDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const renderTask = (task: Task) => {
    const badgeLevel = priorityToLevel(clampPriority(task.priority));
    const categoryText = getCategoryLabel(task.category);
    const duration = task.estimateMinutes ?? 30;

    return (
      <View key={task.id} testID={`inbox-task-${task.id}`}>
        <SurfaceCard style={styles.taskCard}>
          <View style={styles.taskRow}>
            <Pressable
              style={styles.checkWrap}
              onPress={() => {
                if (task.status === 'done') {
                  setStatus(task.id, 'inbox');
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
              testID={`inbox-toggle-${task.id}`}
            >
              <View style={styles.checkCircle} />
            </Pressable>
            <Pressable
              style={styles.taskTextBlock}
              onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
            >
              <Text style={styles.taskTitle} testID={`inbox-task-title-${task.id}`}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta}>
                {categoryText} � {formatDuration(duration)}
              </Text>
            </Pressable>
            <PriorityBadge level={badgeLevel} />
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={() => setStatus(task.id, 'today')}>
              <Ionicons name="sunny" size={14} color={theme.colors.textMuted} />
              <Text style={styles.actionText}>Today</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => setStatus(task.id, 'scheduled')}>
              <Ionicons name="time" size={14} color={theme.colors.textMuted} />
              <Text style={styles.actionText}>Schedule</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => setStatus(task.id, 'archived')}>
              <Ionicons name="archive" size={14} color={theme.colors.textMuted} />
              <Text style={styles.actionText}>Archive</Text>
            </Pressable>
          </View>
        </SurfaceCard>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.root} testID="screen-inbox">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
        >
          <View style={styles.page}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Inbox</Text>
                <Text style={styles.subtitle}>Quickly triage what landed here.</Text>
              </View>
              <IconCircleButton
                icon="options"
                onPress={() => setShowControls((prev) => !prev)}
                testID="inbox-controls-toggle"
              />
            </View>

            {showControls ? (
              <View testID="inbox-controls">
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={16} color={theme.colors.textMuted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search tasks"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.searchInput}
                    testID="inbox-search-input"
                  />
                  {searchQuery.length > 0 ? (
                    <Pressable
                      onPress={() => setSearchQuery('')}
                      hitSlop={8}
                      testID="inbox-search-clear"
                    >
                      <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {([
                    { key: 'all', label: 'All', count: categoryCounts.all },
                    { key: 'work', label: 'Work', count: categoryCounts.work },
                    { key: 'personal', label: 'Personal', count: categoryCounts.personal },
                    { key: 'learning', label: 'Learning', count: categoryCounts.learning },
                  ] as const).map((chip) => {
                    const active = category === chip.key;
                    return (
                      <Pressable
                        key={chip.key}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setCategory(chip.key)}
                        testID={`chip-${chip.key}`}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {chip.label}
                        </Text>
                        <View style={[styles.chipCount, active && styles.chipCountActive]}>
                          <Text style={[styles.chipCountText, active && styles.chipCountTextActive]}>
                            {chip.count}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.sortRow}>
                  {([
                    { key: 'priority', label: 'Priority' },
                    { key: 'due', label: 'Due date' },
                    { key: 'newest', label: 'Newest' },
                  ] as const).map((mode) => {
                    const active = sortMode === mode.key;
                    return (
                      <Pressable
                        key={mode.key}
                        style={[styles.sortChip, active && styles.sortChipActive]}
                        onPress={() => setSortMode(mode.key)}
                        testID={`sort-${mode.key}`}
                      >
                        <Text style={[styles.sortText, active && styles.sortTextActive]} numberOfLines={1}>
                          {mode.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.resultsLabel} testID="inbox-count">
                  {filteredTasks.length} {searchQuery ? 'results' : 'tasks'}
                </Text>
              </View>
            ) : null}

            <View style={styles.list} testID="inbox-list">
              {filteredTasks.map(renderTask)}
            </View>
          </View>
        </ScrollView>

        <Pressable
          style={[styles.fab, { bottom: fabBottom }]}
          onPress={() => setIsAddOpen(true)}
          testID="inbox-add-task"
        >
          <Ionicons name="add" size={28} color={theme.colors.bg} />
        </Pressable>

        {isAddOpen ? (
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss} />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboard}
            >
              <SurfaceCard style={styles.modalCard}>
                <Text style={styles.modalTitle}>New task</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Task title"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.modalInput}
                  autoFocus
                />

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Category</Text>
                  <View style={styles.categoryRow}>
                    {categoryOptions.map((option) => {
                      const active = newCategory === option.key;
                      return (
                        <Pressable
                          key={option.key}
                          style={[styles.categoryChip, active && styles.categoryChipActive]}
                          onPress={() => setNewCategory(option.key)}
                          testID={`new-task-category-${option.key}`}
                        >
                          <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Due date (YYYY-MM-DD)</Text>
                  <TextInput
                    value={newDueAt}
                    onChangeText={setNewDueAt}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.modalInput}
                  />
                  <View style={styles.presetRow}>
                    {[
                      { label: 'Today', value: presetDate(0) },
                      { label: 'Tomorrow', value: presetDate(1) },
                      { label: 'Next week', value: presetDate(7) },
                    ].map((preset) => (
                      <Pressable
                        key={preset.label}
                        style={styles.presetChip}
                        onPress={() => setNewDueAt(preset.value)}
                      >
                        <Text style={styles.presetText}>{preset.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.modalButtonSecondary}
                    onPress={() => {
                      setIsAddOpen(false);
                      setNewTitle('');
                      setNewDueAt('');
                      setNewCategory('general');
                    }}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.modalButtonPrimary} onPress={handleAdd}>
                    <Text style={styles.modalButtonPrimaryText}>Add</Text>
                  </Pressable>
                </View>
              </SurfaceCard>
            </KeyboardAvoidingView>
          </View>
        ) : null}
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
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
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
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: theme.colors.surfaceAlt,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: 'rgba(19,236,236,0.4)',
  },
  chipText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  chipTextActive: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  chipCount: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipCountActive: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  chipCountText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  chipCountTextActive: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sortChip: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: 'rgba(19,236,236,0.4)',
  },
  sortText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  sortTextActive: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  resultsLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.md,
  },
  taskCard: {
    gap: theme.spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkWrap: {
    paddingTop: 2,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(157,185,185,0.5)',
  },
  taskTextBlock: {
    flex: 1,
  },
  taskTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  taskMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
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
  modalKeyboard: {
    width: '100%',
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
  modalInput: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  modalLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalSection: {
    gap: theme.spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: 'rgba(19,236,236,0.4)',
  },
  categoryChipText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  presetText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
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
  modalButtonPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    zIndex: 100,
  },
});


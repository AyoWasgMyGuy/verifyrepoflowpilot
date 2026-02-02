import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useFocus, useTasks } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import { formatDuration, minutesFromParts, splitMinutes } from '../lib/duration';
import { useToast } from '../lib/toast';
import { categoryLabel, categoryOptions, normalizeCategory, type CategoryKey } from '../lib/categories';
import { formatDueAt, validateIsoDate } from '../lib/dueDate';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ navigation, route }: Props) {
  const { tasks, setStatus, updateTask, deleteTask, addSubtask, toggleSubtask } = useTasks();
  const { startFocus } = useFocus();
  const { showToast } = useToast();
  const task = useMemo(() => tasks.find((item) => item.id === route.params.taskId), [tasks, route.params.taskId]);

  const [isDone, setIsDone] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [estimateMinutes, setEstimateMinutes] = useState(45);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [categoryKey, setCategoryKey] = useState<CategoryKey>('general');
  const [newSubtask, setNewSubtask] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const savingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [durationEditorOpen, setDurationEditorOpen] = useState(false);
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setNotes(task.notes ?? '');
    setDueAt(formatDueAt(task.dueAt ?? null) ?? '');
    setEstimateMinutes(task.estimateMinutes ?? 45);
    setPriority(task.priority);
    setCategoryKey(normalizeCategory(task.category));
    setIsDone(task.status === 'done');
    setSaveStatus('idle');
  }, [task]);

  useEffect(() => {
    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const markSaving = useCallback(() => {
    setSaveStatus('saving');
    if (savingTimeoutRef.current) {
      clearTimeout(savingTimeoutRef.current);
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    savingTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 250);
    idleTimeoutRef.current = setTimeout(() => {
      setSaveStatus('idle');
    }, 800);
  }, []);

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <Text style={styles.title}>Task not found</Text>
        </View>
      </Screen>
    );
  }

  const priorityLabel = priority <= 1 ? 'Low' : priority === 2 ? 'Medium' : 'High';
  const isTaskDone = task.status === 'done' || isDone;
  const actionLabel = isTaskDone ? 'Restore' : 'Mark Done';
  const isLongActionLabel = actionLabel.length > 12;
  const subtasks = task.subtasks ?? [];
  const categoryText = categoryLabel(categoryKey);

  const openDurationEditor = (minutes: number) => {
    const parts = splitMinutes(minutes);
    setHoursText(String(parts.hours));
    setMinutesText(String(parts.minutes));
    setDurationEditorOpen(true);
  };

  const commitEdits = (changes?: Partial<typeof task>) => {
    updateTask({
      ...task,
      title: title.trim() || task.title,
      notes: notes.trim() || undefined,
      estimateMinutes,
      priority,
      ...changes,
    });
  };

  const commitDueAt = () => {
    const trimmed = dueAt.trim();
    const nextDueAt = trimmed && validateIsoDate(trimmed) ? trimmed : null;
    setDueAt(nextDueAt ?? '');
    commitEdits({ dueAt: nextDueAt });
    markSaving();
  };

  const applyCategory = (next: CategoryKey) => {
    setCategoryKey(next);
    commitEdits({ category: next === 'general' ? null : next });
    markSaving();
  };

  const handleStartFocus = () => {
    startFocus(task.id, estimateMinutes);
    navigation.navigate('Tabs', { screen: 'Focus', params: { taskId: task.id } });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.root}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.page}>
                <View style={styles.header}>
                  <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
                  </Pressable>
                  <Text style={styles.headerTitle}>Task Details</Text>
                  <View style={styles.headerRight}>
                    <View
                      style={[
                        styles.saveIndicator,
                        saveStatus === 'idle' ? styles.saveIndicatorIdle : styles.saveIndicatorActive,
                      ]}
                    >
                      <Text style={styles.saveText}>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setIsMenuOpen(true);
                        setIsDeleteConfirm(false);
                      }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
                    </Pressable>
                  </View>
                </View>

                <SurfaceCard style={styles.heroCard}>
                  <View style={styles.tagRow}>
                    <Pressable
                      style={styles.categoryBadge}
                      onPress={() => setIsCategoryMenuOpen(true)}
                      testID="taskdetail-category"
                    >
                      <Text style={styles.categoryText}>{categoryText}</Text>
                    </Pressable>
                    <Ionicons name="star-outline" size={18} color={theme.colors.textMuted} />
                  </View>

                  <TextInput
                    value={title}
                    onChangeText={(value) => {
                      setTitle(value);
                      markSaving();
                    }}
                    onEndEditing={() => commitEdits()}
                    style={styles.heroTitle}
                  />

                  <View style={styles.metaRow}>
                    <Pressable
                      style={[styles.metaChipDanger, priority >= 3 && styles.metaChipDangerActive]}
                      onPress={() => {
                        const next = priority <= 1 ? 2 : priority === 2 ? 3 : 1;
                        setPriority(next as 1 | 2 | 3);
                        commitEdits({ priority: next as 1 | 2 | 3 });
                        markSaving();
                      }}
                    >
                      <Ionicons name="flag" size={14} color="#f87171" />
                      <Text style={styles.metaChipTextDanger}>{priorityLabel} Priority</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.metaChipNeutral, styles.metaChipTight]}
                      onPress={() => openDurationEditor(estimateMinutes)}
                    >
                      <Ionicons name="time" size={14} color={theme.colors.textMuted} />
                      <Text style={styles.metaChipTextNeutral}>{formatDuration(estimateMinutes)}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChipNeutral}>
                      <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
                      <TextInput
                        value={dueAt}
                        onChangeText={(value) => {
                          setDueAt(value);
                          markSaving();
                        }}
                        onEndEditing={commitDueAt}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.metaChipInput}
                      />
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="document-text" size={14} color={theme.colors.textMuted} />
                      <Text style={styles.sectionTitle}>Notes</Text>
                    </View>
                    <TextInput
                      value={notes}
                      onChangeText={(value) => {
                        setNotes(value);
                        markSaving();
                      }}
                      onEndEditing={() => commitEdits()}
                      placeholder="Tap to add some context"
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.notesInput}
                      multiline
                    />
                  </View>

                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="checkbox" size={14} color={theme.colors.textMuted} />
                      <Text style={styles.sectionTitle}>Subtasks</Text>
                    </View>
                    {subtasks.length === 0 ? (
                      <Text style={styles.sectionText}>No subtasks yet. Add one below.</Text>
                    ) : (
                      subtasks.map((subtask) => (
                        <Pressable
                          key={subtask.id}
                          style={styles.subtaskRow}
                          onPress={() => toggleSubtask(task.id, subtask.id)}
                        >
                          <View style={[styles.subtaskCircle, subtask.done && styles.subtaskCircleDone]}>
                            {subtask.done ? <View style={styles.subtaskDot} /> : null}
                          </View>
                          <Text style={[styles.subtaskText, subtask.done && styles.subtaskTextDone]}>{subtask.title}</Text>
                        </Pressable>
                      ))
                    )}
                    <View style={styles.subtaskInputRow}>
                      <TextInput
                        value={newSubtask}
                        onChangeText={setNewSubtask}
                        placeholder="Add a subtask"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.subtaskInput}
                      />
                      <Pressable
                        style={styles.subtaskAdd}
                        onPress={() => {
                          markSaving();
                          addSubtask(task.id, newSubtask);
                          setNewSubtask('');
                        }}
                      >
                        <Ionicons name="add" size={16} color={theme.colors.bg} />
                      </Pressable>
                    </View>
                  </View>
                </SurfaceCard>

                <View style={styles.actionRow}>
                  <Pressable style={styles.accentButton} onPress={handleStartFocus}>
                    <Ionicons name="play-circle" size={18} color="#fff" />
                    <Text style={styles.accentButtonText}>Start Focus</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryButton,
                      isLongActionLabel && styles.primaryButtonCompact,
                    ]}
                    onPress={() => {
                      if (isTaskDone) {
                        const snapshot = {
                          id: task.id,
                          prevStatus: task.status,
                          prevCompletedAt: task.completedAt,
                          prevCompletedFrom: task.completedFrom,
                        };
                        const baseTask = { ...task };
                        const restoreStatus = task.completedFrom === 'inbox' ? 'inbox' : 'today';
                        setIsDone(false);
                        setStatus(task.id, restoreStatus);
                        showToast({
                          message: 'Restored',
                          actionLabel: 'Undo',
                          durationMs: 5000,
                          onAction: () => {
                            updateTask({
                              ...baseTask,
                              status: 'done',
                              completedAt: snapshot.prevCompletedAt,
                              completedFrom: snapshot.prevCompletedFrom,
                            });
                            setIsDone(true);
                          },
                        });
                        setTimeout(() => navigation.goBack(), 250);
                        return;
                      }

                      const snapshot = {
                        id: task.id,
                        prevStatus: task.status,
                        prevCompletedAt: task.completedAt,
                        prevCompletedFrom: task.completedFrom,
                      };
                      const baseTask = { ...task };
                      setIsDone(true);
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
                          setIsDone(snapshot.prevStatus === 'done');
                        },
                      });
                      setTimeout(() => navigation.goBack(), 250);
                    }}
                  >
                    <View style={styles.primaryButtonContent}>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.primaryButtonText,
                          isLongActionLabel && styles.primaryButtonTextCompact,
                        ]}
                      >
                        {actionLabel}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

      </KeyboardAvoidingView>

      {isMenuOpen ? (
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setIsMenuOpen(false)} />
          <SurfaceCard style={styles.menuCard}>
            {isDeleteConfirm ? (
              <View style={styles.menuSection}>
                <Text style={styles.menuTitle}>Delete this task?</Text>
                <Text style={styles.menuSubtitle}>This can’t be undone.</Text>
                <View style={styles.menuActions}>
                  <Pressable
                    style={styles.menuButtonSecondary}
                    onPress={() => setIsDeleteConfirm(false)}
                  >
                    <Text style={styles.menuButtonSecondaryText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.menuButtonDanger}
                    onPress={async () => {
                      await deleteTask(task.id);
                      setIsMenuOpen(false);
                      navigation.goBack();
                    }}
                  >
                    <Text style={styles.menuButtonDangerText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.menuSection}>
                <Pressable
                  style={styles.menuItem}
                  onPress={async () => {
                    await setStatus(task.id, 'archived');
                    setIsMenuOpen(false);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.menuItemText}>Archive task</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => setIsDeleteConfirm(true)}>
                  <Text style={styles.menuItemDanger}>Delete task</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => setIsMenuOpen(false)}>
                  <Text style={styles.menuItemText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </SurfaceCard>
        </View>
      ) : null}

      {isCategoryMenuOpen ? (
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setIsCategoryMenuOpen(false)} />
          <SurfaceCard style={styles.menuCard}>
            <View style={styles.menuSection}>
              {categoryOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.menuItem}
                  onPress={() => {
                    applyCategory(option.key);
                    setIsCategoryMenuOpen(false);
                  }}
                  testID={`taskdetail-category-${option.key}`}
                >
                  <Text style={styles.menuItemText}>{option.label}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.menuItem} onPress={() => setIsCategoryMenuOpen(false)}>
                <Text style={styles.menuItemText}>Cancel</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        </View>
      ) : null}

      {durationEditorOpen ? (
        <View style={styles.durationOverlay}>
          <Pressable style={styles.durationBackdrop} onPress={() => setDurationEditorOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.durationKeyboard}
          >
            <SurfaceCard style={styles.durationCard}>
              <Text style={styles.durationTitle}>Set duration</Text>
              <View style={styles.durationInputs}>
                <View style={styles.durationField}>
                  <TextInput
                    value={hoursText}
                    onChangeText={setHoursText}
                    placeholder="Hours"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.durationInput}
                  />
                  <Text style={styles.durationUnit}>h</Text>
                </View>
                <View style={styles.durationField}>
                  <TextInput
                    value={minutesText}
                    onChangeText={setMinutesText}
                    placeholder="Minutes"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.durationInput}
                  />
                  <Text style={styles.durationUnit}>m</Text>
                </View>
              </View>
              <View style={styles.durationActions}>
                <Pressable
                  style={styles.durationButtonSecondary}
                  onPress={() => setDurationEditorOpen(false)}
                >
                  <Text style={styles.durationButtonSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.durationButtonPrimary}
                  onPress={() => {
                    const total = minutesFromParts(hoursText, minutesText);
                    setEstimateMinutes(total);
                    commitEdits({ estimateMinutes: total });
                    markSaving();
                    setDurationEditorOpen(false);
                  }}
                >
                  <Text style={styles.durationButtonPrimaryText}>Done</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          </KeyboardAvoidingView>
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
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.title,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  saveText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  saveIndicator: {
    minWidth: 72,
    height: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  saveIndicatorIdle: {
    opacity: 0,
  },
  saveIndicatorActive: {
    opacity: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  menuSection: {
    gap: theme.spacing.sm,
  },
  menuTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  menuItem: {
    paddingVertical: theme.spacing.sm,
  },
  menuItemText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuItemDanger: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  menuButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuButtonSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  menuButtonDanger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  menuButtonDangerText: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  headerTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  heroCard: {
    flex: 1,
    gap: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(251,146,60,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.35)',
  },
  categoryText: {
    color: '#FB923C',
    fontFamily: theme.fonts.display,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaChipDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  metaChipDangerActive: {
    borderColor: 'rgba(248,113,113,0.4)',
  },
  metaChipTextDanger: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  metaChipNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flex: 1,
  },
  metaChipTight: {
    flex: 0,
  },
  metaChipTextNeutral: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  metaChipInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    flex: 1,
    paddingVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionBlock: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  sectionText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  notesInput: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    minHeight: 60,
    lineHeight: 18,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  subtaskCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCircleDone: {
    borderColor: theme.colors.primary,
  },
  subtaskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  subtaskText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  subtaskTextDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  subtaskInput: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  subtaskAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  accentButton: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  accentButtonText: {
    color: '#fff',
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonCompact: {
    paddingHorizontal: 12,
    gap: 6,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  primaryButtonTextCompact: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  durationOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  durationBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  durationKeyboard: {
    width: '100%',
  },
  durationCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  durationTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  durationInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  durationField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationInput: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  durationUnit: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  durationActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  durationButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  durationButtonSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  durationButtonPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  durationButtonPrimaryText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
});

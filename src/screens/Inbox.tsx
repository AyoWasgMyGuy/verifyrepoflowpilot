import React, { useMemo, useState } from 'react';
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
  const inboxTasks = useMemo(() => tasks.filter((task) => task.status === 'inbox'), [tasks]);
  const fabBottom = floatingOffset;
  const scrollPaddingBottom = floatingOffset + 140;

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await addTasks([
      {
        title,
        notes: '',
        priority: 2,
        estimateMinutes: 30,
        status: 'inbox',
      },
    ]);
    setNewTitle('');
    setIsAddOpen(false);
  };

  const renderTask = (task: Task) => {
    const badgeLevel = priorityToLevel(clampPriority(task.priority));
    const category = task.category || task.notes?.split(' ').slice(0, 1).join('') || 'Work';
    const duration = task.estimateMinutes ?? 30;

    return (
      <SurfaceCard key={task.id} style={styles.taskCard}>
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
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskMeta}>
              {category} • {formatDuration(duration)}
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
              <IconCircleButton icon="options" onPress={() => {}} />
            </View>

            <View style={styles.list} testID="inbox-list">
              {inboxTasks.map(renderTask)}
            </View>
          </View>
        </ScrollView>

        <Pressable style={[styles.fab, { bottom: fabBottom }]} onPress={() => setIsAddOpen(true)}>
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
                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.modalButtonSecondary}
                    onPress={() => {
                      setIsAddOpen(false);
                      setNewTitle('');
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

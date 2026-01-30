import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IconCircleButton } from '../components/IconCircleButton';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { Task } from '../lib/repo';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const { tasks, setStatus } = useTasks();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const inboxTasks = useMemo(() => tasks.filter((task) => task.status === 'inbox'), [tasks]);

  const renderTask = (task: Task) => {
    const isHigh = task.priority >= 4;
    const category = task.notes?.split(' ').slice(0, 1).join('') || 'Work';
    const duration = task.estimateMinutes ?? 30;

    return (
      <SurfaceCard key={task.id} style={styles.taskCard}>
        <View style={styles.taskRow}>
          <View style={styles.checkCircle} />
          <View style={styles.taskTextBlock}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskMeta}>{category} • {duration}m</Text>
          </View>
          {isHigh ? (
            <View style={styles.highBadge}>
              <Text style={styles.highBadgeText}>High</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={() => setStatus(task.id, 'today')}>
            <Ionicons name="sunny" size={14} color={theme.colors.textMuted} />
            <Text style={styles.actionText}>Today</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Plan')}>
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
    <Screen scroll>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>Quickly triage what landed here.</Text>
          </View>
          <IconCircleButton icon="options" onPress={() => {}} />
        </View>

        <View style={styles.list}>
          {inboxTasks.map(renderTask)}
        </View>
      </View>

      <Pressable style={styles.fab} onPress={() => rootNavigation.navigate('BrainDump')}>
        <Ionicons name="add" size={28} color={theme.colors.bg} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 180,
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
  highBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  highBadgeText: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: 10,
    textTransform: 'uppercase',
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
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 92,
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
    elevation: 4,
  },
});

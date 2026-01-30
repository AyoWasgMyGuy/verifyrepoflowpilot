import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Chip } from '../components/ui/Chip';
import { IconButton } from '../components/ui/IconButton';
import { Screen } from '../components/ui/Screen';
import { SmallPlusFAB } from '../components/ui/FABs';
import { TaskCard } from '../components/ui/TaskCard';
import { useTasks } from '../lib/hooks';
import { Task } from '../lib/repo';
import { RootStackParamList, TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Inbox'>;

type FilterKey = 'all' | 'today' | 'overdue' | 'later';

function formatDue(dueAt?: string | null) {
  if (!dueAt) return 'No due date';
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return 'No due date';
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dueAt?: string | null) {
  if (!dueAt) return false;
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function InboxScreen({ navigation }: Props) {
  const { tasks, setStatus } = useTasks();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const inboxTasks = useMemo(() => tasks.filter((task) => task.status === 'inbox'), [tasks]);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();
    let result = inboxTasks;
    if (search) {
      result = result.filter((task) => task.title.toLowerCase().includes(search));
    }
    if (filter === 'today') {
      result = result.filter((task) => task.dueAt && !isOverdue(task.dueAt));
    }
    if (filter === 'overdue') {
      result = result.filter((task) => isOverdue(task.dueAt));
    }
    if (filter === 'later') {
      result = result.filter((task) => !task.dueAt);
    }
    return result;
  }, [filter, inboxTasks, query]);

  const grouped = useMemo(() => {
    const overdue = filteredTasks.filter((task) => isOverdue(task.dueAt));
    const today = filteredTasks.filter((task) => task.dueAt && !isOverdue(task.dueAt));
    const later = filteredTasks.filter((task) => !task.dueAt);
    return { overdue, today, later };
  }, [filteredTasks]);

  const renderTask = (task: Task) => (
    <TaskCard
      key={task.id}
      title={task.title}
      subtitle={formatDue(task.dueAt)}
      onPress={() => rootNavigation.navigate('TaskDetail', { taskId: task.id })}
    >
      <Chip label="Today" variant="primary" onPress={() => setStatus(task.id, 'today')} />
      <Chip label="Schedule" variant="info" onPress={() => navigation.navigate('Plan')} />
      <Chip label="Archive" variant="neutral" onPress={() => setStatus(task.id, 'archived')} />
    </TaskCard>
  );

  return (
    <Screen scroll>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>{filteredTasks.length} tasks to triage</Text>
          </View>
          <IconButton icon="filter" onPress={() => {}} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Due' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'later', label: 'No date' },
          ].map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key as FilterKey)}
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {grouped.overdue.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Overdue</Text>
            <View style={styles.cardList}>{grouped.overdue.map(renderTask)}</View>
          </View>
        ) : null}

        {grouped.today.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Today</Text>
            <View style={styles.cardList}>{grouped.today.map(renderTask)}</View>
          </View>
        ) : null}

        {grouped.later.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Later</Text>
            <View style={styles.cardList}>{grouped.later.map(renderTask)}</View>
          </View>
        ) : null}

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyText}>Capture a brain dump to refill your inbox.</Text>
          </View>
        ) : null}

        <SmallPlusFAB onPress={() => rootNavigation.navigate('BrainDump')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 160,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.body,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(19,236,236,0.12)',
  },
  filterText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  filterTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginBottom: theme.spacing.sm,
  },
  cardList: {
    gap: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    textAlign: 'center',
  },
});

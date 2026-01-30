import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ navigation, route }: Props) {
  const { tasks, setStatus } = useTasks();
  const task = tasks.find((item) => item.id === route.params.taskId);

  if (!task) {
    return (
      <Screen>
        <View style={styles.page}>
          <Text style={styles.title}>Task not found</Text>
        </View>
      </Screen>
    );
  }

  const priorityLabel = task.priority >= 4 ? 'High' : task.priority === 3 ? 'Medium' : 'Low';

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Task Details</Text>
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
        </View>

        <SurfaceCard style={styles.heroCard}>
          <View style={styles.tagRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Work</Text>
            </View>
            <Ionicons name="star-outline" size={18} color={theme.colors.textMuted} />
          </View>

          <Text style={styles.heroTitle}>{task.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChipDanger}>
              <Ionicons name="flag" size={14} color="#f87171" />
              <Text style={styles.metaChipTextDanger}>{priorityLabel} Priority</Text>
            </View>
            <View style={styles.metaChipNeutral}>
              <Ionicons name="time" size={14} color={theme.colors.textMuted} />
              <Text style={styles.metaChipTextNeutral}>{task.estimateMinutes ?? 30}m</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChipNeutral}>
              <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
              <Text style={styles.metaChipTextNeutral}>Due Today</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={14} color={theme.colors.textMuted} />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.sectionText}>{task.notes || 'No additional notes. Tap to add some context.'}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.subtaskRow}>
              <View style={styles.subtaskCircle} />
              <Text style={styles.subtaskDone}>Draft outline</Text>
            </View>
            <View style={styles.subtaskRow}>
              <View style={styles.subtaskCircle} />
              <Text style={styles.subtaskText}>Finalize metrics</Text>
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.actionRow}>
          <Pressable style={styles.accentButton} onPress={() => navigation.navigate('Tabs', { screen: 'Focus', params: { taskId: task.id } })}>
            <Ionicons name="play-circle" size={18} color="#fff" />
            <Text style={styles.accentButtonText}>Start Focus</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => setStatus(task.id, 'done')}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.bg} />
            <Text style={styles.primaryButtonText}>Mark Done</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
  metaChipTextNeutral: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
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
  },
  subtaskDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.body,
  },
  subtaskText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
});

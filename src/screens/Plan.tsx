import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../components/ui/Chip';
import { GlassCard } from '../components/ui/GlassCard';
import { Screen } from '../components/ui/Screen';
import { TaskRow } from '../components/ui/TaskRow';
import { useTasks } from '../lib/hooks';
import { theme } from '../styles/theme';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function PlanScreen() {
  const { tasks } = useTasks();
  const todayIndex = new Date().getDay();
  const selectedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const scheduled = useMemo(() => tasks.filter((task) => task.status === 'today'), [tasks]);
  const unscheduled = useMemo(() => tasks.filter((task) => task.status === 'inbox'), [tasks]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Plan</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <Chip label="Auto-plan" variant="primary" />
        </View>

        <View style={styles.weekRow}>
          {days.map((day, index) => {
            const isActive = index === selectedIndex;
            return (
              <View key={day} style={[styles.dayPill, isActive && styles.dayPillActive]}>
                <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>{day}</Text>
                <Text style={[styles.dayNumber, isActive && styles.dayNumberActive]}>
                  {new Date().getDate() - selectedIndex + index}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            {scheduled.length === 0 ? (
              <GlassCard>
                <Text style={styles.cardTitle}>No blocks yet</Text>
                <Text style={styles.cardSubtitle}>Drag a task from the list below.</Text>
              </GlassCard>
            ) : (
              scheduled.slice(0, 3).map((task, index) => (
                <GlassCard key={task.id} style={styles.blockCard}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockTitle}>{task.title}</Text>
                    <Chip label={index === 0 ? 'Work' : 'Personal'} variant={index === 0 ? 'info' : 'warning'} />
                  </View>
                  <Text style={styles.cardSubtitle}>{`${9 + index * 2}:00 - ${10 + index * 2}:00 (${task.estimateMinutes ?? 30}m)`}</Text>
                </GlassCard>
              ))
            )}
            <GlassCard style={styles.emptyBlock}>
              <Text style={styles.cardSubtitle}>Open block</Text>
              <Text style={styles.cardTitle}>Add a session</Text>
            </GlassCard>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unscheduled tasks</Text>
          <View style={styles.list}>
            {unscheduled.length === 0 ? (
              <GlassCard>
                <Text style={styles.cardTitle}>All tasks scheduled</Text>
                <Text style={styles.cardSubtitle}>Great job staying ahead.</Text>
              </GlassCard>
            ) : (
              unscheduled.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  subtitle={task.dueAt ? `Due ${task.dueAt}` : 'No due date'}
                  priorityLabel={`P${task.priority}`}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 140,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  weekRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dayPill: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  dayLabelActive: {
    color: theme.colors.bg,
  },
  dayNumber: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 14,
    marginTop: 2,
  },
  dayNumberActive: {
    color: theme.colors.bg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  timeline: {
    gap: theme.spacing.sm,
  },
  blockCard: {
    gap: theme.spacing.sm,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  emptyBlock: {
    borderStyle: 'dashed',
  },
  cardTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
    marginTop: 4,
  },
  list: {
    gap: theme.spacing.sm,
  },
});

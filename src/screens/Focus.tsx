import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { GlassCard } from '../components/ui/GlassCard';
import { Screen } from '../components/ui/Screen';
import { TaskRow } from '../components/ui/TaskRow';
import { useProfile, useTasks } from '../lib/hooks';
import { TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Focus'>;

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function FocusScreen({ navigation, route }: Props) {
  const { tasks, setStatus } = useTasks();
  const { profile } = useProfile();
  const [activeTaskId, setActiveTaskId] = useState(route.params?.taskId);
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks]
  );

  const focusMinutes =
    (activeTask?.estimateMinutes && activeTask.estimateMinutes > 0
      ? activeTask.estimateMinutes
      : undefined) || profile?.focusMinutesDefault || 25;
  const [remainingSeconds, setRemainingSeconds] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setActiveTaskId(route.params?.taskId);
  }, [route.params?.taskId]);

  useEffect(() => {
    setRemainingSeconds(focusMinutes * 60);
    setIsRunning(false);
  }, [focusMinutes, activeTaskId]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleDone = async () => {
    if (!activeTask) return;
    await setStatus(activeTask.id, 'done');
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Today');
    }
  };

  if (!activeTask) {
    const todayTasks = tasks.filter((task) => task.status === 'today');
    return (
      <Screen scroll>
        <View style={styles.page}>
          <Text style={styles.title}>Focus</Text>
          <Text style={styles.subtitle}>Pick a task to start a calm session.</Text>
          <View style={styles.sectionSpacer}>
            {todayTasks.length === 0 ? (
              <GlassCard>
                <Text style={styles.cardTitle}>No task selected</Text>
                <Text style={styles.cardSubtitle}>Mark something for Today or start from Inbox.</Text>
              </GlassCard>
            ) : (
              <FlatList
                data={todayTasks}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <TaskRow
                      title={item.title}
                      subtitle={item.dueAt ? `Due ${item.dueAt}` : 'No due date'}
                      priorityLabel={`P${item.priority}`}
                      onPress={() => navigation.navigate('Focus', { taskId: item.id })}
                    />
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Screen>
    );
  }

  const progress = 1 - remainingSeconds / (focusMinutes * 60);

  return (
    <Screen>
      <View style={styles.page}>
        <Text style={styles.title}>Focus</Text>
        <Text style={styles.subtitle}>{activeTask.title}</Text>

        <View style={styles.timerBlock}>
          <Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
          </View>
          <Text style={styles.timerNote}>{focusMinutes} minute session</Text>
        </View>

        <GlassCard style={styles.taskCard}>
          <Text style={styles.cardTitle}>Current task</Text>
          <Text style={styles.cardSubtitle}>{activeTask.title}</Text>
        </GlassCard>

        <View style={styles.buttonRow}>
          <PrimaryButton label="Finish" onPress={handleDone} style={styles.flex} />
          <SecondaryButton
            label={isRunning ? 'Pause' : 'Start'}
            onPress={() => setIsRunning((prev) => !prev)}
            style={styles.flex}
          />
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.cardSubtitle}>Sessions</Text>
            <Text style={styles.statValue}>1</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.cardSubtitle}>Deep minutes</Text>
            <Text style={styles.statValue}>{focusMinutes}</Text>
          </GlassCard>
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
    paddingBottom: theme.spacing.xl,
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
  sectionSpacer: {
    marginTop: theme.spacing.lg,
  },
  listItem: {
    marginBottom: theme.spacing.sm,
  },
  timerBlock: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  timerText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 48,
  },
  progressTrack: {
    marginTop: theme.spacing.md,
    height: 6,
    width: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  timerNote: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  taskCard: {
    marginTop: theme.spacing.lg,
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
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  flex: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
    marginTop: theme.spacing.xs,
  },
});

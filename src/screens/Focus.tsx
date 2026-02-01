import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useFocus, useProfile, useTasks } from '../lib/hooks';
import { TabsParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = BottomTabScreenProps<TabsParamList, 'Focus'>;

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function FocusScreen({ navigation, route }: Props) {
  const { tasks, setStatus } = useTasks();
  const { profile } = useProfile();
  const { session, startFocus, pauseFocus, resumeFocus, updateRemaining, endFocus } = useFocus();
  const [soundEnabled, setSoundEnabled] = useState(false);

  const requestedTaskId = route.params?.taskId;
  const activeTaskId = session.taskId ?? requestedTaskId;
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks]
  );

  const focusMinutes =
    (activeTask?.estimateMinutes && activeTask.estimateMinutes > 0
      ? activeTask.estimateMinutes
      : undefined) || profile?.focusMinutesDefault || 25;

  useEffect(() => {
    if (requestedTaskId && requestedTaskId !== session.taskId) {
      startFocus(requestedTaskId, focusMinutes);
    }
  }, [requestedTaskId, session.taskId, focusMinutes, startFocus]);

  useEffect(() => {
    if (!session.taskId && !requestedTaskId && session.durationSeconds === 0) {
      startFocus('focus_session', focusMinutes);
    }
  }, [session.taskId, requestedTaskId, session.durationSeconds, focusMinutes, startFocus]);

  useEffect(() => {
    if (!session.isRunning) return;
    if (session.remainingSeconds <= 0) {
      pauseFocus();
      return;
    }
    const timer = setInterval(() => {
      updateRemaining(Math.max(session.remainingSeconds - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.isRunning, session.remainingSeconds, updateRemaining, pauseFocus]);

  const handleDone = async () => {
    if (activeTask) {
      await setStatus(activeTask.id, 'done');
    }
    endFocus();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Today');
    }
  };

  const totalSeconds = session.durationSeconds || focusMinutes * 60;
  const remainingSeconds = session.durationSeconds ? session.remainingSeconds : totalSeconds;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;

  return (
    <Screen>
      <View style={styles.page} testID="screen-focus">
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.flowPill}>
            <Ionicons name="leaf" size={12} color={theme.colors.primary} />
            <Text style={styles.flowText}>Flow State</Text>
          </View>
          <Pressable style={styles.iconButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <SurfaceCard style={styles.taskCard}>
          <View style={styles.taskIcon}>
            <Ionicons name="brush" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.taskLabel}>Working on</Text>
            <Text style={styles.taskTitle}>{activeTask?.title ?? 'Deep Work Session'}</Text>
          </View>
        </SurfaceCard>

        <Pressable
          style={[styles.soundPill, soundEnabled && styles.soundPillActive]}
          onPress={() => setSoundEnabled((prev) => !prev)}
        >
          <Ionicons
            name={soundEnabled ? 'volume-high' : 'volume-mute'}
            size={16}
            color={soundEnabled ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text style={[styles.soundText, soundEnabled && styles.soundTextActive]}>Pink Noise</Text>
          {soundEnabled ? (
            <View style={styles.soundBars}>
              <View style={styles.soundBar} />
              <View style={[styles.soundBar, styles.soundBarMid]} />
              <View style={[styles.soundBar, styles.soundBarShort]} />
            </View>
          ) : null}
        </Pressable>

        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryButton} onPress={handleDone}>
            <Ionicons name="stop-circle" size={18} color={theme.colors.text} />
            <Text style={styles.secondaryButtonText}>Finish</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => (session.isRunning ? pauseFocus() : resumeFocus())}
          >
            <Ionicons name={session.isRunning ? 'pause' : 'play'} size={20} color={theme.colors.bg} />
            <Text style={styles.primaryButtonText}>{session.isRunning ? 'Pause' : 'Start'}</Text>
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
    paddingBottom: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  flowText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerBlock: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  timerText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 80,
  },
  progressTrack: {
    width: 96,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19,236,236,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(19,236,236,0.2)',
  },
  taskLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  taskTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
    marginTop: 2,
  },
  soundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'center',
  },
  soundPillActive: {
    borderColor: 'rgba(19,236,236,0.3)',
    backgroundColor: 'rgba(19,236,236,0.12)',
  },
  soundText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  soundTextActive: {
    color: theme.colors.primary,
  },
  soundBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginLeft: 4,
  },
  soundBar: {
    width: 3,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  soundBarMid: {
    height: 8,
  },
  soundBarShort: {
    height: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  primaryButton: {
    flex: 1.3,
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

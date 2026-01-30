import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { theme } from '../styles/theme';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dates = [21, 22, 23, 24, 25, 26, 27];

export function PlanScreen() {
  const [promptTime, setPromptTime] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Plan</Text>
            <Text style={styles.subtitle}>October 24</Text>
          </View>
          <Pressable style={styles.autoPlanButton}>
            <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
            <Text style={styles.autoPlanText}>Auto-plan</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
          {dates.map((date, index) => {
            const isToday = date === 24;
            return (
              <View key={date} style={[styles.dayPill, isToday && styles.dayPillActive]}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{days[index]}</Text>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberActive]}>{date}</Text>
                {isToday ? <View style={styles.dayDot} /> : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.timelineWrapper}>
          <View style={styles.currentLine}>
            <Text style={styles.currentTime}>12:15</Text>
            <View style={styles.currentLineBar} />
            <View style={styles.currentDot} />
          </View>

          <ScrollView contentContainerStyle={styles.timeline} showsVerticalScrollIndicator={false}>
            {['09:00', '11:00', '12:30', '14:00', '16:00', '17:00'].map((time) => {
              let content = null;
              if (time === '09:00') {
                content = (
                  <SurfaceCard style={styles.blockCardPrimary}>
                    <Text style={styles.blockTag}>Work</Text>
                    <Text style={styles.blockTitle}>Deep Work Strategy</Text>
                    <Text style={styles.blockSubtitle}>Review Q4 goals and align with marketing team.</Text>
                  </SurfaceCard>
                );
              } else if (time === '12:30') {
                content = (
                  <SurfaceCard style={styles.blockCardAccent}>
                    <View style={styles.blockAccentRow}>
                      <View>
                        <Text style={[styles.blockTag, styles.blockTagAccent]}>Personal</Text>
                        <Text style={styles.blockTitle}>Lunch & Walk</Text>
                      </View>
                      <Ionicons name="walk" size={18} color={theme.colors.accent} />
                    </View>
                  </SurfaceCard>
                );
              } else {
                content = (
                  <Pressable style={styles.emptySlot} onPress={() => setPromptTime(time)}>
                    <Ionicons name="add" size={20} color={theme.colors.textMuted} />
                  </Pressable>
                );
              }

              return (
                <View key={time} style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{time}</Text>
                  <View style={styles.timeContent}>{content}</View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {promptTime ? (
          <View style={styles.modalOverlay}>
            <SurfaceCard style={styles.modalCard}>
              <Text style={styles.modalTitle}>Schedule for {promptTime}</Text>
              <TextInput
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Task name..."
                placeholderTextColor={theme.colors.textMuted}
                style={styles.modalInput}
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButtonSecondary} onPress={() => setPromptTime(null)}>
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalButtonPrimary} onPress={() => { setPromptTime(null); setNewTaskTitle(''); }}>
                  <Text style={styles.modalButtonPrimaryText}>Add Task</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
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
  autoPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(19,236,236,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(19,236,236,0.25)',
  },
  autoPlanText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 11,
  },
  weekRow: {
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dayPill: {
    width: 52,
    height: 80,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dayPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  dayLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  dayLabelActive: {
    color: theme.colors.bg,
    opacity: 0.7,
  },
  dayNumber: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 16,
    marginTop: 4,
  },
  dayNumberActive: {
    color: theme.colors.bg,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.bg,
    marginTop: 6,
  },
  timelineWrapper: {
    flex: 1,
    position: 'relative',
  },
  currentLine: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTime: {
    width: 50,
    textAlign: 'right',
    paddingRight: 8,
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 11,
  },
  currentLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginLeft: -3,
  },
  timeline: {
    paddingBottom: 180,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timeLabel: {
    width: 50,
    textAlign: 'right',
    paddingTop: 8,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  timeContent: {
    flex: 1,
  },
  blockCardPrimary: {
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    backgroundColor: 'rgba(19,236,236,0.1)',
  },
  blockCardAccent: {
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  blockTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(19,236,236,0.15)',
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  blockTagAccent: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    color: theme.colors.accent,
  },
  blockTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  blockSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  blockAccentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptySlot: {
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalButtons: {
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
});

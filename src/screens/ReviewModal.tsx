import React, { useMemo, useState } from 'react';
import {
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomActionDock } from '../components/BottomActionDock';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { formatDuration, minutesFromParts, splitMinutes } from '../lib/duration';
import { clampPriority } from '../lib/priority';
import { TaskDraft } from '../lib/repo';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

type DraftState = TaskDraft & { key: string };

export function ReviewModal({ navigation, route }: Props) {
  const { addTasks } = useTasks();
  const initialDrafts = useMemo<DraftState[]>(
    () =>
      route.params.items.map((title, index) => ({
        key: `${index}`,
        title,
        priority: 3,
        estimateMinutes: 30,
        dueAt: null,
      })),
    [route.params.items]
  );

  const [drafts, setDrafts] = useState<DraftState[]>(initialDrafts);
  const [durationEditor, setDurationEditor] = useState<{ key: string } | null>(null);
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');

  const updateDraft = (key: string, changes: Partial<DraftState>) => {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...changes } : draft)));
  };

  const openDurationEditor = (key: string, minutes: number) => {
    const parts = splitMinutes(minutes);
    setDurationEditor({ key });
    setHoursText(String(parts.hours));
    setMinutesText(String(parts.minutes));
  };

  const handleSave = async () => {
    const cleaned = drafts
      .map((draft) => ({
        title: draft.title.trim(),
        priority: clampPriority(draft.priority),
        estimateMinutes: draft.estimateMinutes,
        dueAt: draft.dueAt?.trim() ? draft.dueAt.trim() : null,
      }))
      .filter((draft) => draft.title.length > 0);

    if (cleaned.length === 0) {
      navigation.goBack();
      return;
    }

    await addTasks(cleaned);
    navigation.navigate('Tabs', { screen: 'Inbox' });
  };

  return (
    <Screen>
      <View style={styles.page} testID="review-modal">
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Review Tasks</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SurfaceCard style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightHeaderRow}>
                <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
                <Text style={styles.insightHeaderText}>AI Insight</Text>
              </View>
            </View>
            <View style={styles.insightBody}>
              <Text style={styles.cardTitle}>Merge Suggestion</Text>
              <Text style={styles.cardSubtitle}>Seems like your tasks are focused on Work. Added tags automatically.</Text>
              <Pressable style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply Suggestion</Text>
              </Pressable>
            </View>
          </SurfaceCard>

          <View style={styles.detectedHeader}>
            <Text style={styles.detectedTitle}>Detected Tasks</Text>
            <Text style={styles.detectedCount}>{drafts.length} tasks</Text>
          </View>

          <View style={styles.draftList}>
            {drafts.map((draft) => (
              <SurfaceCard key={draft.key} style={styles.draftCard}>
                <View style={styles.draftTopRow}>
                  <TextInput
                    value={draft.title}
                    onChangeText={(value) => updateDraft(draft.key, { title: value })}
                    placeholder="Task title"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.titleInput}
                  />
                  <Pressable onPress={() => setDrafts((prev) => prev.filter((item) => item.key !== draft.key))}>
                    <Ionicons name="trash" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>PRIORITY</Text>
                  <View style={styles.priorityPillGroup}>
                    {[
                      { value: 1, label: 'LOW' },
                      { value: 2, label: 'MED' },
                      { value: 3, label: 'HIGH' },
                    ].map((level) => {
                      const clamped = clampPriority(level.value);
                      const active = draft.priority === clamped;
                      return (
                        <Pressable
                          key={level.value}
                          style={[styles.priorityPill, active && styles.priorityPillActive]}
                          onPress={() => updateDraft(draft.key, { priority: clamped })}
                        >
                          <Text
                            numberOfLines={1}
                            style={[styles.priorityText, active && styles.priorityTextActive]}
                          >
                            {level.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.durationRow}>
                  <Text style={styles.metaLabel}>DURATION</Text>
                  <Pressable
                    style={styles.durationChip}
                    onPress={() => openDurationEditor(draft.key, draft.estimateMinutes ?? 30)}
                  >
                    <Ionicons name="time" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.durationText}>{formatDuration(draft.estimateMinutes ?? 30)}</Text>
                  </Pressable>
                </View>
              </SurfaceCard>
            ))}
          </View>
        </ScrollView>

        <BottomActionDock style={styles.dock}>
          <PrimaryButton
            label={`Save ${drafts.length} Tasks to Inbox`}
            onPress={handleSave}
            testID="add-all-tasks"
          />
        </BottomActionDock>

        {durationEditor ? (
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setDurationEditor(null)} />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboard}
            >
              <SurfaceCard style={styles.modalCard}>
                <Text style={styles.modalTitle}>Set duration</Text>
                <View style={styles.durationInputRow}>
                  <View style={styles.durationField}>
                    <TextInput
                      value={hoursText}
                      onChangeText={setHoursText}
                      placeholder="Hours"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="number-pad"
                      style={styles.modalInput}
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
                      style={styles.modalInput}
                    />
                    <Text style={styles.durationUnit}>m</Text>
                  </View>
                </View>
                <View style={styles.presetRow}>
                  {[15, 30, 45, 60, 90, 120, 180].map((value) => (
                    <Pressable
                      key={value}
                      style={styles.presetChip}
                      onPress={() => {
                        const parts = splitMinutes(value);
                        setHoursText(String(parts.hours));
                        setMinutesText(String(parts.minutes));
                      }}
                    >
                      <Text style={styles.presetText}>{formatDuration(value)}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.modalButtons}>
                  <Pressable
                    style={styles.modalButtonSecondary}
                    onPress={() => setDurationEditor(null)}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalButtonPrimary}
                    onPress={() => {
                      const total = minutesFromParts(hoursText, minutesText);
                      updateDraft(durationEditor.key, { estimateMinutes: total });
                      setDurationEditor(null);
                    }}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Done</Text>
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
  page: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 160,
    gap: theme.spacing.lg,
  },
  insightCard: {
    padding: 0,
    overflow: 'hidden',
  },
  insightHeader: {
    height: 96,
    padding: theme.spacing.lg,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(19,236,236,0.1)',
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightHeaderText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
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
  },
  applyButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(19,236,236,0.2)',
    backgroundColor: 'rgba(19,236,236,0.1)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detectedTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  detectedCount: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  draftList: {
    gap: theme.spacing.md,
  },
  draftCard: {
    gap: theme.spacing.md,
  },
  draftTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  titleInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
    paddingVertical: 6,
  },
  metaRow: {
    gap: theme.spacing.sm,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1,
  },
  priorityPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 180,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 4,
    borderRadius: 999,
  },
  priorityPill: {
    flex: 1,
    minHeight: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPillActive: {
    backgroundColor: theme.colors.primary,
  },
  priorityText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  priorityTextActive: {
    color: theme.colors.bg,
  },
  durationRow: {
    gap: theme.spacing.sm,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#111818',
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  durationText: {
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
  durationInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  durationField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationUnit: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
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
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

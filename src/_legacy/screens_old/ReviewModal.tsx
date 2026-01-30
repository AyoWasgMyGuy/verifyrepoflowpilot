import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomActionDock } from '../components/BottomActionDock';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { TaskDraft } from '../lib/repo';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

type DraftState = TaskDraft & { key: string };

function clampPriority(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return value as 1 | 2 | 3 | 4 | 5;
}

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

  const updateDraft = (key: string, changes: Partial<DraftState>) => {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...changes } : draft)));
  };

  const handleSave = async () => {
    const cleaned = drafts
      .map((draft) => ({
        title: draft.title.trim(),
        priority: draft.priority,
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
      <View style={styles.page}>
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
                  <Ionicons name="reorder-three" size={18} color={theme.colors.textMuted} />
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
                  <View style={styles.priorityPillGroup}>
                    {[1, 2, 3].map((level) => {
                      const active = draft.priority === clampPriority(level * 2 - 1);
                      return (
                        <Pressable
                          key={level}
                          style={[styles.priorityPill, active && styles.priorityPillActive]}
                          onPress={() => updateDraft(draft.key, { priority: clampPriority(level * 2 - 1) })}
                        >
                          <Text style={[styles.priorityText, active && styles.priorityTextActive]}>{level}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.durationPill}>
                    <Ionicons name="time" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.durationText}>{draft.estimateMinutes ?? 30}m</Text>
                  </View>
                </View>
              </SurfaceCard>
            ))}
          </View>
        </ScrollView>

        <BottomActionDock style={styles.dock}>
          <PrimaryButton label={`Save ${drafts.length} Tasks to Inbox`} onPress={handleSave} />
        </BottomActionDock>
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
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  titleInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 28,
  },
  priorityPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111818',
    padding: 4,
    borderRadius: theme.radius.pill,
  },
  priorityPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPillActive: {
    backgroundColor: theme.colors.primary,
  },
  priorityText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  priorityTextActive: {
    color: theme.colors.bg,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#111818',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

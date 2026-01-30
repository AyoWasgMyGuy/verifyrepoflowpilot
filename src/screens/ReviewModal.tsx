import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomActionDock } from '../components/ui/BottomActionDock';
import { Chip } from '../components/ui/Chip';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { Screen } from '../components/ui/Screen';
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
        estimateMinutes: undefined,
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Review tasks</Text>
            <SecondaryButton label="Close" onPress={() => navigation.goBack()} />
          </View>

          <GlassCard style={styles.insightCard}>
            <Text style={styles.cardTitle}>AI Insight</Text>
            <Text style={styles.cardSubtitle}>Group similar tasks and prioritize the top wins.</Text>
            <View style={styles.insightMock} />
          </GlassCard>

          <View style={styles.draftList}>
            {drafts.map((draft) => (
              <GlassCard key={draft.key} style={styles.draftCard}>
                <TextInput
                  value={draft.title}
                  onChangeText={(value) => updateDraft(draft.key, { title: value })}
                  placeholder="Task title"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.titleInput}
                />

                <View style={styles.priorityRow}>
                  {[1, 2, 3, 4, 5].map((level) => {
                    const active = draft.priority === level;
                    return (
                      <Pressable
                        key={level}
                        onPress={() => updateDraft(draft.key, { priority: clampPriority(level) })}
                        style={[styles.priorityPill, active && styles.priorityPillActive]}
                      >
                        <Text style={[styles.priorityText, active && styles.priorityTextActive]}>P{level}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.metaRow}>
                  <TextInput
                    value={draft.estimateMinutes ? String(draft.estimateMinutes) : ''}
                    onChangeText={(value) => updateDraft(draft.key, { estimateMinutes: value ? Number(value) : undefined })}
                    placeholder="Estimate"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="number-pad"
                    style={styles.metaInput}
                  />
                  <TextInput
                    value={draft.dueAt ?? ''}
                    onChangeText={(value) => updateDraft(draft.key, { dueAt: value })}
                    placeholder="Due date"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.metaInput}
                  />
                </View>

                <View style={styles.deleteRow}>
                  <Chip
                    label="Delete"
                    variant="danger"
                    onPress={() => setDrafts((prev) => prev.filter((item) => item.key !== draft.key))}
                  />
                </View>
              </GlassCard>
            ))}

            <Pressable
              onPress={() => setDrafts((prev) => [...prev, { key: `${Date.now()}`, title: '', priority: 3, estimateMinutes: undefined, dueAt: null }])}
              style={styles.addCard}
            >
              <Text style={styles.addText}>Add another task</Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomActionDock style={styles.dock}>
          <PrimaryButton label="Save to Inbox" onPress={handleSave} />
        </BottomActionDock>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingBottom: 0,
  },
  scroll: {
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
    fontSize: theme.text.headline,
  },
  insightCard: {
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
  insightMock: {
    marginTop: theme.spacing.sm,
    height: 90,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  draftList: {
    gap: theme.spacing.md,
  },
  draftCard: {
    gap: theme.spacing.sm,
  },
  titleInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  priorityPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  priorityPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  priorityText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  priorityTextActive: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaInput: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  deleteRow: {
    marginTop: theme.spacing.xs,
  },
  addCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  addText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

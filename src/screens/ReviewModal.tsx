import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomActionDock } from '../components/BottomActionDock';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SurfaceCard } from '../components/SurfaceCard';
import { useTasks } from '../lib/hooks';
import { formatDuration, minutesFromParts, splitMinutes } from '../lib/duration';
import { clampPriority } from '../lib/priority';
import { TaskDraft } from '../lib/repo';
import { useToast } from '../lib/toast';
import { categoryOptions, normalizeCategory, type CategoryKey } from '../lib/categories';
import { validateIsoDate } from '../lib/dueDate';
import { clearReviewDraft, formatSavedAgo, loadReviewDraft, saveReviewDraft, REVIEW_DRAFT_KEY } from '../lib/reviewDraft';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

type DraftState = Omit<TaskDraft, 'category'> & { key: string; category: CategoryKey };

export function ReviewModal({ navigation, route }: Props) {
  const { addTasks } = useTasks();
  const { showToast } = useToast();
  const openSavedDraft = route.params?.openSavedDraft === true;
  const initialDrafts = useMemo<DraftState[]>(
    () =>
      (route.params?.items ?? []).map((title, index) => ({
        key: `${index}`,
        title,
        priority: 3,
        estimateMinutes: 30,
        dueAt: null,
        category: 'general',
      })),
    [route.params?.items]
  );

  const [drafts, setDrafts] = useState<DraftState[]>(initialDrafts);
  const [resumePrompt, setResumePrompt] = useState<{ drafts: DraftState[]; savedAt: number } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [durationEditor, setDurationEditor] = useState<{ key: string } | null>(null);
  const [hoursText, setHoursText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  const [suppressEmptyState, setSuppressEmptyState] = useState(false);
  const isDiscardingRef = useRef(false);

  const normalizeDrafts = (items: Array<TaskDraft & { key: string }>): DraftState[] =>
    items.map((draft) => ({
      ...draft,
      priority: draft.priority ?? 3,
      estimateMinutes: draft.estimateMinutes ?? 30,
      dueAt: draft.dueAt ?? null,
      category: normalizeCategory(draft.category),
    }));

  const updateDraft = (key: string, changes: Partial<DraftState>) => {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...changes } : draft)));
  };

  const openDurationEditor = (key: string, minutes: number) => {
    const parts = splitMinutes(minutes);
    setDurationEditor({ key });
    setHoursText(String(parts.hours));
    setMinutesText(String(parts.minutes));
  };

  useEffect(() => {
    let mounted = true;
    const loadDraft = async () => {
      const stored = await loadReviewDraft();
      if (!mounted) return;
      if (openSavedDraft) {
        if (stored?.drafts?.length) {
          setDrafts(normalizeDrafts(stored.drafts));
        } else {
          setDrafts([]);
        }
        setResumePrompt(null);
        setIsInitialized(true);
        return;
      }

      if (stored?.drafts?.length) {
        setResumePrompt({ drafts: normalizeDrafts(stored.drafts), savedAt: stored.savedAt });
        setIsInitialized(false);
        return;
      }
      setIsInitialized(true);
    };
    loadDraft();
    return () => {
      mounted = false;
    };
  }, [openSavedDraft]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isDiscardingRef.current) return;
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }
    if (drafts.length === 0) {
      clearReviewDraft();
      return;
    }
    autosaveRef.current = setTimeout(() => {
      saveReviewDraft(
        drafts.map((draft) => ({
          key: draft.key,
          title: draft.title,
          priority: draft.priority,
          estimateMinutes: draft.estimateMinutes,
          dueAt: draft.dueAt ?? null,
          category: draft.category === 'general' ? null : draft.category,
        }))
      );
    }, 300);
    return () => {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
      }
    };
  }, [drafts, isInitialized]);

  const handleSave = async () => {
    const cleaned = drafts
      .map((draft) => ({
        title: draft.title.trim(),
        priority: clampPriority(draft.priority),
        estimateMinutes: draft.estimateMinutes,
        dueAt:
          draft.dueAt?.trim() && validateIsoDate(draft.dueAt.trim()) ? draft.dueAt.trim() : null,
        category: draft.category === 'general' ? null : draft.category,
      }))
      .filter((draft) => draft.title.length > 0);

    if (cleaned.length === 0) {
      navigation.goBack();
      return;
    }

    await addTasks(cleaned);
    await clearReviewDraft();
    navigation.navigate('Tabs', { screen: 'Inbox' });
  };

  const handleBack = async () => {
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }
    if (drafts.length > 0) {
      await saveReviewDraft(
        drafts.map((draft) => ({
          key: draft.key,
          title: draft.title,
          priority: draft.priority,
          estimateMinutes: draft.estimateMinutes,
          dueAt: draft.dueAt ?? null,
          category: draft.category === 'general' ? null : draft.category,
        }))
      );
    } else {
      await clearReviewDraft();
    }
    showToast({
      message: 'Draft saved',
      actionLabel: 'Review',
      durationMs: 5000,
      onAction: () => navigation.navigate('Review', { openSavedDraft: true }),
    });
    if (navigation.popToTop) {
      navigation.popToTop();
    }
    navigation.navigate('Tabs', { screen: 'Today' });
  };

  const discardDraftAndExit = async () => {
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }
    isDiscardingRef.current = true;
    setSuppressEmptyState(true);
    await AsyncStorage.removeItem(REVIEW_DRAFT_KEY);
    setDrafts([]);
    setResumePrompt(null);
    setIsInitialized(true);
    setDiscardConfirm(false);
    setMenuOpen(false);
    showToast({ message: 'Draft discarded' });
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs', params: { screen: 'Today' } }],
      })
    );
  };

  return (
    <Screen>
      <View style={styles.page} testID="review-modal">
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Review Tasks</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              setMenuOpen(true);
              setDiscardConfirm(false);
            }}
            testID="review-menu-button"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
          </Pressable>
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
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>CATEGORY</Text>
                  <View style={styles.categoryPillGroup}>
                    {categoryOptions.map((option) => {
                      const active = draft.category === option.key;
                      return (
                        <Pressable
                          key={option.key}
                          style={[styles.categoryPill, active && styles.categoryPillActive]}
                          onPress={() => updateDraft(draft.key, { category: option.key })}
                          testID={`review-category-${draft.key}-${option.key}`}
                        >
                          <Text
                            numberOfLines={1}
                            style={[styles.categoryText, active && styles.categoryTextActive]}
                          >
                            {option.label.toUpperCase()}
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

        {resumePrompt ? (
          <View style={styles.resumeOverlay}>
            <Pressable style={styles.resumeBackdrop} />
            <SurfaceCard style={styles.resumeCard}>
              <Text style={styles.resumeTitle}>Resume draft?</Text>
              <Text style={styles.resumeSubtitle}>
                You have a saved review draft with {resumePrompt.drafts.length} tasks. {formatSavedAgo(resumePrompt.savedAt)}
              </Text>
              <View style={styles.resumeActions}>
                <Pressable
                  style={styles.resumePrimary}
                  onPress={() => {
                    setDrafts(resumePrompt.drafts);
                    setResumePrompt(null);
                    setIsInitialized(true);
                  }}
                  testID="review-resume"
                >
                  <Text style={styles.resumePrimaryText}>Resume</Text>
                </Pressable>
                <Pressable
                  style={styles.resumeSecondary}
                  onPress={async () => {
                    await clearReviewDraft();
                    setDrafts(initialDrafts);
                    setResumePrompt(null);
                    setIsInitialized(true);
                  }}
                  testID="review-start-new"
                >
                  <Text style={styles.resumeSecondaryText}>Start new</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          </View>
        ) : null}

        {openSavedDraft && isInitialized && drafts.length === 0 && !suppressEmptyState ? (
          <View style={styles.emptyStateWrap}>
            <SurfaceCard style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>No saved draft</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start a new brain dump to create tasks.
              </Text>
              <Pressable
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('BrainDump')}
              >
                <Text style={styles.emptyStateButtonText}>Start Brain Dump</Text>
              </Pressable>
            </SurfaceCard>
          </View>
        ) : null}

        {menuOpen ? (
          <View style={styles.menuOverlay}>
            <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
            <SurfaceCard style={styles.menuCard}>
              {discardConfirm ? (
                <View style={styles.menuSection}>
                  <Text style={styles.menuTitle}>Discard draft?</Text>
                  <Text style={styles.menuSubtitle}>This clears your current edits.</Text>
                  <View style={styles.menuActions}>
                    <Pressable
                      style={styles.menuButtonSecondary}
                      onPress={() => setDiscardConfirm(false)}
                    >
                      <Text style={styles.menuButtonSecondaryText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                  style={styles.menuButtonDanger}
                  onPress={discardDraftAndExit}
                  testID="review-discard-confirm"
                >
                  <Text style={styles.menuButtonDangerText}>Discard</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.menuSection}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => setDiscardConfirm(true)}
                    testID="review-discard"
                  >
                    <Text style={styles.menuItemDanger}>Discard draft</Text>
                  </Pressable>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => setMenuOpen(false)}
                    testID="review-discard-cancel"
                  >
                    <Text style={styles.menuItemText}>Cancel</Text>
                  </Pressable>
                </View>
              )}
            </SurfaceCard>
          </View>
        ) : null}

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
  categoryPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 220,
    maxWidth: '100%',
    backgroundColor: theme.colors.surfaceAlt,
    padding: 4,
    borderRadius: 999,
  },
  categoryPill: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 10,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  categoryTextActive: {
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
  resumeOverlay: {
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
  resumeBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  resumeCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  resumeTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  resumeSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  resumeActions: {
    gap: theme.spacing.sm,
  },
  resumePrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  resumePrimaryText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  resumeSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resumeSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  menuSection: {
    gap: theme.spacing.sm,
  },
  menuTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  menuActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  menuItem: {
    paddingVertical: theme.spacing.sm,
  },
  menuItemText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuItemDanger: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  menuButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuButtonSecondaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  menuButtonDanger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  menuButtonDangerText: {
    color: '#f87171',
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
  emptyStateWrap: {
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
  emptyStateCard: {
    width: '100%',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  emptyStateSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  emptyStateButtonText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 12,
  },
});

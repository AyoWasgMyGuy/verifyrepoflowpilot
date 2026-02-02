import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskDraft } from './repo';

export type ReviewDraftPayload = {
  version: 1;
  drafts: Array<TaskDraft & { key: string }>;
  savedAt: number;
};

export const REVIEW_DRAFT_KEY = 'flowpilot.reviewDraft.v1';

export async function saveReviewDraft(drafts: ReviewDraftPayload['drafts']): Promise<ReviewDraftPayload | null> {
  if (!drafts.length) {
    await clearReviewDraft();
    return null;
  }
  const payload: ReviewDraftPayload = {
    version: 1,
    drafts,
    savedAt: Date.now(),
  };
  await AsyncStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify(payload));
  return payload;
}

export async function loadReviewDraft(): Promise<ReviewDraftPayload | null> {
  const stored = await AsyncStorage.getItem(REVIEW_DRAFT_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<ReviewDraftPayload> & { savedAt?: number | string };
    if (!parsed.drafts || parsed.drafts.length === 0) {
      return null;
    }
    const savedAt =
      typeof parsed.savedAt === 'number'
        ? parsed.savedAt
        : typeof parsed.savedAt === 'string'
          ? Date.parse(parsed.savedAt)
          : Date.now();
    return {
      version: 1,
      drafts: parsed.drafts as ReviewDraftPayload['drafts'],
      savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export async function clearReviewDraft(): Promise<void> {
  await AsyncStorage.removeItem(REVIEW_DRAFT_KEY);
}

export function formatSavedAgo(savedAt: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - savedAt);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Saved just now';
  if (minutes < 60) return `Saved ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Saved ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Saved ${days}d ago`;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryFilter, SortMode } from './taskFilters';

export type InboxViewPrefs = {
  sortMode: SortMode;
  category: CategoryFilter;
};

export const INBOX_VIEW_PREFS_KEY = 'flowpilot.inboxView.v1';

const DEFAULT_PREFS: InboxViewPrefs = {
  sortMode: 'priority',
  category: 'all',
};

function isSortMode(value: unknown): value is SortMode {
  return value === 'priority' || value === 'due' || value === 'newest';
}

function isCategoryKey(value: unknown): value is CategoryFilter {
  return value === 'all' || value === 'work' || value === 'personal' || value === 'learning';
}

export async function loadInboxViewPrefs(): Promise<InboxViewPrefs> {
  const stored = await AsyncStorage.getItem(INBOX_VIEW_PREFS_KEY);
  if (!stored) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(stored) as Partial<InboxViewPrefs>;
    return {
      sortMode: isSortMode(parsed.sortMode) ? parsed.sortMode : DEFAULT_PREFS.sortMode,
      category: isCategoryKey(parsed.category) ? parsed.category : DEFAULT_PREFS.category,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveInboxViewPrefs(prefs: InboxViewPrefs): Promise<void> {
  await AsyncStorage.setItem(INBOX_VIEW_PREFS_KEY, JSON.stringify(prefs));
}

export function getDefaultInboxViewPrefs(): InboxViewPrefs {
  return DEFAULT_PREFS;
}

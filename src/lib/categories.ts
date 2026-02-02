export type CategoryKey = 'general' | 'work' | 'personal' | 'learning';

export const categoryOptions: Array<{ key: CategoryKey; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
  { key: 'learning', label: 'Learning' },
];

export function normalizeCategory(input?: string | null): CategoryKey {
  if (!input) return 'general';
  const value = input.trim().toLowerCase();
  if (!value) return 'general';
  if (value === 'general') return 'general';
  if (['work', 'job'].includes(value)) return 'work';
  if (['personal', 'home'].includes(value)) return 'personal';
  if (['learning', 'learn', 'study', 'education'].includes(value)) return 'learning';
  return 'general';
}

export function categoryLabel(key: CategoryKey): string {
  switch (key) {
    case 'work':
      return 'Work';
    case 'personal':
      return 'Personal';
    case 'learning':
      return 'Learning';
    default:
      return 'General';
  }
}

export function getCategoryLabel(input?: string | null): string {
  return categoryLabel(normalizeCategory(input));
}

export function categoryBadgeText(key: CategoryKey): string {
  return categoryLabel(key).toUpperCase();
}

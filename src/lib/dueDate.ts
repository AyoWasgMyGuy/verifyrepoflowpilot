export function validateIsoDate(text: string): boolean {
  if (!text) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const parsed = Date.parse(`${text}T00:00:00Z`);
  return Number.isFinite(parsed);
}

export function parseDueAt(dueAt: string | null | undefined): number | null {
  if (!dueAt) return null;
  if (validateIsoDate(dueAt)) {
    return Date.parse(`${dueAt}T00:00:00Z`);
  }
  const parsed = Date.parse(dueAt);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDueAt(dueAt: string | null | undefined): string | null {
  if (!dueAt) return null;
  if (validateIsoDate(dueAt)) return dueAt;
  const parsed = Date.parse(dueAt);
  if (!Number.isFinite(parsed)) return null;
  const date = new Date(parsed);
  return date.toISOString().slice(0, 10);
}

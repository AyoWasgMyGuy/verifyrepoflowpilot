import { Task } from './repo';
import { normalizeCategory } from './categories';
import { parseDueAt } from './dueDate';

export type SortMode = 'priority' | 'due' | 'newest';
export type CategoryFilter = 'all' | 'work' | 'personal' | 'learning';

export function matchesQuery(task: Task, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack = `${task.title} ${task.notes ?? ''}`.toLowerCase();
  return haystack.includes(trimmed);
}

function parseDate(input?: string | null): number {
  if (!input) return 0;
  const parsed = Date.parse(input);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
    const aDue = parseDueAt(a.dueAt ?? null);
    const bDue = parseDueAt(b.dueAt ?? null);
    const aNewest = parseDate(a.createdAt || a.updatedAt);
    const bNewest = parseDate(b.createdAt || b.updatedAt);

    if (mode === 'priority') {
      if (priorityDiff !== 0) return priorityDiff;
      if (aDue === null && bDue !== null) return 1;
      if (aDue !== null && bDue === null) return -1;
      if (aDue !== null && bDue !== null && aDue !== bDue) return aDue - bDue;
      return bNewest - aNewest;
    }

    if (mode === 'due') {
      if (aDue === null && bDue !== null) return 1;
      if (aDue !== null && bDue === null) return -1;
      if (aDue !== null && bDue !== null && aDue !== bDue) return aDue - bDue;
      if (priorityDiff !== 0) return priorityDiff;
      return bNewest - aNewest;
    }

    return bNewest - aNewest;
  });
}

export function filterTasks(tasks: Task[], query: string, categoryKey: CategoryFilter): Task[] {
  const queryFiltered = tasks.filter((task) => matchesQuery(task, query));
  if (categoryKey === 'all') return queryFiltered;
  return queryFiltered.filter((task) => normalizeCategory(task.category) === categoryKey);
}

export function getCategoryCounts(tasks: Task[], query: string) {
  return tasks.reduce(
    (acc, task) => {
      if (!matchesQuery(task, query)) return acc;
      acc.all += 1;
      const key = normalizeCategory(task.category);
      if (key === 'work') acc.work += 1;
      if (key === 'personal') acc.personal += 1;
      if (key === 'learning') acc.learning += 1;
      if (key === 'general') acc.general += 1;
      return acc;
    },
    { all: 0, work: 0, personal: 0, learning: 0, general: 0 }
  );
}

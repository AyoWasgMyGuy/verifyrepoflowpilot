import {
  filterTasks,
  getCategoryCounts,
  matchesQuery,
  sortTasks,
} from '../taskFilters';
import { getCategoryLabel, normalizeCategory } from '../categories';
import { parseDueAt } from '../dueDate';
import { Task } from '../repo';

const baseTask: Omit<Task, 'id' | 'title' | 'createdAt' | 'updatedAt'> = {
  status: 'inbox',
  priority: 2,
  estimateMinutes: 30,
};

const makeTask = (partial: Partial<Task> & { id: string; title: string }): Task => ({
  ...baseTask,
  id: partial.id,
  title: partial.title,
  createdAt: partial.createdAt ?? new Date('2026-02-01T10:00:00Z').toISOString(),
  updatedAt: partial.updatedAt ?? new Date('2026-02-01T10:00:00Z').toISOString(),
  notes: partial.notes,
  dueAt: partial.dueAt,
  category: partial.category,
  priority: partial.priority ?? 2,
  status: partial.status ?? 'inbox',
  estimateMinutes: partial.estimateMinutes,
});

describe('taskFilters', () => {
  it('normalizes categories and defaults to general', () => {
    expect(normalizeCategory('work')).toBe('work');
    expect(normalizeCategory('Personal')).toBe('personal');
    expect(normalizeCategory('study')).toBe('learning');
    expect(normalizeCategory('')).toBe('general');
    expect(normalizeCategory(undefined)).toBe('general');
    expect(normalizeCategory('unknown')).toBe('general');
  });

  it('returns human-friendly labels', () => {
    expect(getCategoryLabel('work')).toBe('Work');
    expect(getCategoryLabel('learning')).toBe('Learning');
    expect(getCategoryLabel(null)).toBe('General');
  });

  it('matches query against title and notes', () => {
    const task = makeTask({ id: '1', title: 'Pay rent', notes: 'Bank transfer' });
    expect(matchesQuery(task, 'rent')).toBe(true);
    expect(matchesQuery(task, 'transfer')).toBe(true);
    expect(matchesQuery(task, 'missing')).toBe(false);
  });

  it('parses due dates and ignores invalid', () => {
    expect(parseDueAt('2026-02-05')).toBeDefined();
    expect(parseDueAt('not-a-date')).toBeNull();
    expect(parseDueAt(undefined)).toBeNull();
  });

  it('sorts by priority with due date tiebreakers', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Low', priority: 1, dueAt: '2026-02-10' }),
      makeTask({ id: '2', title: 'High soon', priority: 3, dueAt: '2026-02-05' }),
      makeTask({ id: '3', title: 'High later', priority: 3, dueAt: '2026-02-12' }),
    ];
    const sorted = sortTasks(tasks, 'priority').map((task) => task.id);
    expect(sorted).toEqual(['2', '3', '1']);
  });

  it('sorts by due date and keeps missing due at bottom', () => {
    const tasks = [
      makeTask({ id: '1', title: 'No due', priority: 3, dueAt: null }),
      makeTask({ id: '2', title: 'Soon', priority: 1, dueAt: '2026-02-02' }),
      makeTask({ id: '3', title: 'Later', priority: 3, dueAt: '2026-02-10' }),
    ];
    const sorted = sortTasks(tasks, 'due').map((task) => task.id);
    expect(sorted).toEqual(['2', '3', '1']);
  });

  it('sorts by newest', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Old', createdAt: '2026-01-01T10:00:00Z' }),
      makeTask({ id: '2', title: 'New', createdAt: '2026-02-01T10:00:00Z' }),
    ];
    const sorted = sortTasks(tasks, 'newest').map((task) => task.id);
    expect(sorted).toEqual(['2', '1']);
  });

  it('filters by query and category', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Alpha', category: 'work' }),
      makeTask({ id: '2', title: 'Beta', category: 'personal', notes: 'home' }),
      makeTask({ id: '3', title: 'Gamma', category: undefined }),
    ];
    const filtered = filterTasks(tasks, 'beta', 'personal');
    expect(filtered.map((task) => task.id)).toEqual(['2']);
    expect(filterTasks(tasks, '', 'work').map((task) => task.id)).toEqual(['1']);
  });

  it('counts categories after query filter', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Alpha', category: 'work' }),
      makeTask({ id: '2', title: 'Beta', category: 'personal' }),
      makeTask({ id: '3', title: 'Beta Learn', category: 'learning' }),
      makeTask({ id: '4', title: 'Beta Other', category: undefined }),
    ];
    const counts = getCategoryCounts(tasks, 'beta');
    expect(counts.all).toBe(3);
    expect(counts.work).toBe(0);
    expect(counts.personal).toBe(1);
    expect(counts.learning).toBe(1);
    expect(counts.general).toBe(1);
  });
});

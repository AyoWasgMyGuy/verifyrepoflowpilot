import { formatDueAt, parseDueAt, validateIsoDate } from '../dueDate';

describe('dueDate helpers', () => {
  it('validates ISO dates', () => {
    expect(validateIsoDate('2026-02-01')).toBe(true);
    expect(validateIsoDate('2026-2-01')).toBe(false);
    expect(validateIsoDate('')).toBe(false);
  });

  it('parses due dates and returns null for invalid', () => {
    expect(parseDueAt('2026-02-01')).toBeGreaterThan(0);
    expect(parseDueAt('not-a-date')).toBeNull();
    expect(parseDueAt(null)).toBeNull();
  });

  it('formats due dates to ISO when possible', () => {
    expect(formatDueAt('2026-02-01')).toBe('2026-02-01');
    expect(formatDueAt('invalid')).toBeNull();
  });
});
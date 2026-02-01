export type PriorityLevel = 'low' | 'medium' | 'high';

export function clampPriority(value: number): 1 | 2 | 3 {
  if (value <= 1) return 1;
  if (value <= 2) return 2;
  return 3;
}

export function priorityToLevel(value: 1 | 2 | 3): PriorityLevel {
  if (value === 1) return 'low';
  if (value === 2) return 'medium';
  return 'high';
}

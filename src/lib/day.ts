import { Task } from './repo';

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isCompletedToday(task: Task): boolean {
  return (
    task.status === 'done' &&
    task.completedFrom === 'today' &&
    !!task.completedAt &&
    task.completedAt.slice(0, 10) === todayKey()
  );
}

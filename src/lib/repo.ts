export type TaskStatus = 'inbox' | 'today' | 'done' | 'archived';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  estimateMinutes?: number;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  title: string;
  notes?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimateMinutes?: number;
  dueAt?: string | null;
};

export type UserProfile = {
  displayName: string;
  workStart: string;
  workEnd: string;
  focusMinutesDefault: number;
};

export interface TaskRepo {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  clearAll(): Promise<void>;
}

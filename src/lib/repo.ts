export type TaskStatus = 'inbox' | 'today' | 'scheduled' | 'done' | 'archived';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  completedFrom?: TaskStatus;
  completedAt?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimateMinutes?: number;
  dueAt?: string | null;
  category?: string;
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  title: string;
  notes?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  estimateMinutes?: number;
  dueAt?: string | null;
  status?: TaskStatus;
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

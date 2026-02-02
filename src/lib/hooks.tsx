import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LocalTaskRepo } from './localRepo';
import { Subtask, Task, TaskDraft, TaskStatus, UserProfile } from './repo';
import { removeItem, setItem } from './storage';

const repo = new LocalTaskRepo();

const SETTINGS_KEY = {
  ai: 'flowpilot:settings:ai',
  notifications: 'flowpilot:settings:notifications',
};

type TasksContextValue = {
  tasks: Task[];
  isLoading: boolean;
  addTasks: (drafts: TaskDraft[]) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  setStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  resetTasks: () => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

type ProfileContextValue = {
  profile: UserProfile | null;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

type FocusSession = {
  taskId?: string;
  isRunning: boolean;
  remainingSeconds: number;
  durationSeconds: number;
};

type FocusContextValue = {
  session: FocusSession;
  startFocus: (taskId: string, durationMinutes: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  updateRemaining: (seconds: number) => void;
  endFocus: () => void;
};

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

function createId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createSubtaskId() {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tasksRef = useRef<Task[]>([]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await repo.getTasks();
    tasksRef.current = data;
    setTasks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(async (next: Task[]) => {
    tasksRef.current = next;
    setTasks(next);
    await repo.saveTasks(next);
  }, []);

  const addTasks = useCallback(async (drafts: TaskDraft[]) => {
    const now = nowIso();
    const newTasks: Task[] = drafts
      .map((draft) => ({
        id: createId(),
        title: draft.title.trim(),
        notes: draft.notes,
        status: draft.status ?? 'inbox',
        priority: draft.priority,
        estimateMinutes: draft.estimateMinutes,
        dueAt: draft.dueAt ?? null,
        category: draft.category ?? null,
        createdAt: now,
        updatedAt: now,
      }))
      .filter((task) => task.title.length > 0);

    const next = [...tasksRef.current, ...newTasks];
    await persist(next);
    console.log(`[tasks] saved ${newTasks.length} to inbox`);
  }, [persist]);

  const updateTask = useCallback(async (task: Task) => {
    const next = tasksRef.current.map((item) => (item.id === task.id ? { ...task, updatedAt: nowIso() } : item));
    await persist(next);
  }, [persist]);

  const setStatus = useCallback(async (id: string, status: TaskStatus) => {
    const next = tasksRef.current.map((item) => {
      if (item.id !== id) return item;
      const prevStatus = item.status;
      const updated = { ...item, status, updatedAt: nowIso() };
      if (status === 'done') {
        return { ...updated, completedFrom: prevStatus, completedAt: nowIso() };
      }
      if (prevStatus === 'done') {
        return { ...updated, completedFrom: undefined, completedAt: undefined };
      }
      return updated;
    });
    await persist(next);
    if (status === 'done') {
      console.log(`[tasks] marked done ${id}`);
    }
  }, [persist]);

  const deleteTask = useCallback(async (id: string) => {
    const next = tasksRef.current.filter((task) => task.id !== id);
    await persist(next);
  }, [persist]);

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const next = tasksRef.current.map((task) => {
      if (task.id !== taskId) return task;
      const subtasks = task.subtasks ? [...task.subtasks] : [];
      const subtask: Subtask = { id: createSubtaskId(), title: trimmed, done: false };
      return { ...task, subtasks: [...subtasks, subtask], updatedAt: nowIso() };
    });
    await persist(next);
  }, [persist]);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const next = tasksRef.current.map((task) => {
      if (task.id !== taskId) return task;
      const subtasks = (task.subtasks ?? []).map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
      );
      return { ...task, subtasks, updatedAt: nowIso() };
    });
    await persist(next);
  }, [persist]);

  const resetTasks = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({ tasks, isLoading, addTasks, updateTask, setStatus, deleteTask, addSubtask, toggleSubtask, resetTasks, refresh }),
    [tasks, isLoading, addTasks, updateTask, setStatus, deleteTask, addSubtask, toggleSubtask, resetTasks, refresh]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await repo.getProfile();
    setProfile(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfile = useCallback(async (next: UserProfile) => {
    setProfile(next);
    await repo.saveProfile(next);
  }, []);

  const resetProfile = useCallback(async () => {
    setProfile(null);
    await removeItem('flowpilot:profile');
  }, []);

  const value = useMemo(() => ({ profile, isLoading, saveProfile, resetProfile }), [profile, isLoading, saveProfile, resetProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<FocusSession>({
    taskId: undefined,
    isRunning: false,
    remainingSeconds: 0,
    durationSeconds: 0,
  });

  const startFocus = useCallback((taskId: string, durationMinutes: number) => {
    const durationSeconds = Math.max(durationMinutes, 1) * 60;
    setSession({
      taskId,
      isRunning: false,
      remainingSeconds: durationSeconds,
      durationSeconds,
    });
  }, []);

  const pauseFocus = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resumeFocus = useCallback(() => {
    setSession((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const updateRemaining = useCallback((seconds: number) => {
    setSession((prev) => ({ ...prev, remainingSeconds: seconds }));
  }, []);

  const endFocus = useCallback(() => {
    setSession({ taskId: undefined, isRunning: false, remainingSeconds: 0, durationSeconds: 0 });
  }, []);

  const value = useMemo(
    () => ({ session, startFocus, pauseFocus, resumeFocus, updateRemaining, endFocus }),
    [session, startFocus, pauseFocus, resumeFocus, updateRemaining, endFocus]
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return ctx;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error('useFocus must be used within FocusProvider');
  }
  return ctx;
}

export async function saveSetting(key: keyof typeof SETTINGS_KEY, value: boolean) {
  await setItem(SETTINGS_KEY[key], value);
}

export async function resetSettings() {
  await removeItem(SETTINGS_KEY.ai);
  await removeItem(SETTINGS_KEY.notifications);
}

export const settingsKeys = SETTINGS_KEY;

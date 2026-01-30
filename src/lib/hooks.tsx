import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LocalTaskRepo } from './localRepo';
import { Task, TaskDraft, TaskStatus, UserProfile } from './repo';
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

function createId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await repo.getTasks();
    setTasks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(async (next: Task[]) => {
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
        status: 'inbox' as const,
        priority: draft.priority,
        estimateMinutes: draft.estimateMinutes,
        dueAt: draft.dueAt ?? null,
        createdAt: now,
        updatedAt: now,
      }))
      .filter((task) => task.title.length > 0);

    const next = [...tasks, ...newTasks];
    await persist(next);
    console.log(`[tasks] saved ${newTasks.length} to inbox`);
  }, [persist, tasks]);

  const updateTask = useCallback(async (task: Task) => {
    const next = tasks.map((item) => (item.id === task.id ? { ...task, updatedAt: nowIso() } : item));
    await persist(next);
  }, [persist, tasks]);

  const setStatus = useCallback(async (id: string, status: TaskStatus) => {
    const next = tasks.map((item) =>
      item.id === id ? { ...item, status, updatedAt: nowIso() } : item
    );
    await persist(next);
    if (status === 'done') {
      console.log(`[tasks] marked done ${id}`);
    }
  }, [persist, tasks]);

  const resetTasks = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({ tasks, isLoading, addTasks, updateTask, setStatus, resetTasks, refresh }),
    [tasks, isLoading, addTasks, updateTask, setStatus, resetTasks, refresh]
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

export async function saveSetting(key: keyof typeof SETTINGS_KEY, value: boolean) {
  await setItem(SETTINGS_KEY[key], value);
}

export async function resetSettings() {
  await removeItem(SETTINGS_KEY.ai);
  await removeItem(SETTINGS_KEY.notifications);
}

export const settingsKeys = SETTINGS_KEY;

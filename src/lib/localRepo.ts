import { clearAll, getItem, setItem } from './storage';
import { Task, TaskRepo, UserProfile } from './repo';

const TASKS_KEY = 'flowpilot:tasks';
const PROFILE_KEY = 'flowpilot:profile';

export class LocalTaskRepo implements TaskRepo {
  async getTasks(): Promise<Task[]> {
    return getItem<Task[]>(TASKS_KEY, []);
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    await setItem(TASKS_KEY, tasks);
  }

  async getProfile(): Promise<UserProfile | null> {
    return getItem<UserProfile | null>(PROFILE_KEY, null);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await setItem(PROFILE_KEY, profile);
  }

  async clearAll(): Promise<void> {
    await clearAll();
  }
}

import { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParamList = {
  Today: undefined;
  Inbox: undefined;
  Plan: undefined;
  Focus: { taskId?: string } | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Onboarding2: { displayName?: string; goal?: string } | undefined;
  Tabs: NavigatorScreenParams<TabsParamList>;
  BrainDump: undefined;
  Review: { items: string[] };
  TaskDetail: { taskId: string };
  TodayList: undefined;
};

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BrainDumpModal } from '../screens/BrainDumpModal';
import { OnboardingScreen } from '../screens/Onboarding';
import { Onboarding2Screen } from '../screens/Onboarding2';
import { ReviewModal } from '../screens/ReviewModal';
import { TaskDetailScreen } from '../screens/TaskDetail';
import { TodayListScreen } from '../screens/TodayList';
import { SplashScreen } from '../screens/Splash';
import { TabsNavigator } from './TabsNavigator';
import { RootStackParamList } from './types';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  initialRouteName: keyof RootStackParamList;
};

export function RootNavigator({ initialRouteName }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { fontFamily: theme.fonts.display, color: theme.colors.text },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding2" component={Onboarding2Screen} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TodayList" component={TodayListScreen} options={{ title: 'Today' }} />
      <Stack.Screen
        name="BrainDump"
        component={BrainDumpModal}
        options={{ presentation: 'transparentModal', headerShown: false }}
      />
      <Stack.Screen name="Review" component={ReviewModal} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

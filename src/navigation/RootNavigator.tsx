import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/Auth';
import { BrainDumpModal } from '../screens/BrainDumpModal';
import { OnboardingScreen } from '../screens/Onboarding';
import { ReviewModal } from '../screens/ReviewModal';
import { TaskDetailScreen } from '../screens/TaskDetail';
import { WelcomeScreen } from '../screens/Welcome';
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
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task' }} />
      <Stack.Screen
        name="BrainDump"
        component={BrainDumpModal}
        options={{ presentation: 'transparentModal', headerShown: false }}
      />
      <Stack.Screen name="Review" component={ReviewModal} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

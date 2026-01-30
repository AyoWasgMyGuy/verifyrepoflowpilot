import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FocusScreen } from '../screens/Focus';
import { InboxScreen } from '../screens/Inbox';
import { PlanScreen } from '../screens/Plan';
import { SettingsScreen } from '../screens/Settings';
import { TodayScreen } from '../screens/Today';
import { TabsParamList } from './types';
import { BottomTabBar } from '../components/BottomTabBar';

const Tab = createBottomTabNavigator<TabsParamList>();

export function TabsNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen name="Plan" component={PlanScreen} />
        <Tab.Screen name="Focus" component={FocusScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
}

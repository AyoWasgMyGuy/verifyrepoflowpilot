import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icons: Record<string, { active: IconName; inactive: IconName }> = {
  Today: { active: 'sunny', inactive: 'sunny-outline' },
  Inbox: { active: 'archive', inactive: 'archive-outline' },
  Plan: { active: 'calendar', inactive: 'calendar-outline' },
  Focus: { active: 'timer', inactive: 'timer-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const testIds: Record<string, string> = {
  Today: 'tab-today',
  Inbox: 'tab-inbox',
  Plan: 'tab-plan',
  Focus: 'tab-focus',
  Settings: 'tab-settings',
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 40, tint: 'dark' as const } : {};

  return (
    <Container {...containerProps} style={styles.container}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              testID={testIds[route.name] ?? `tab-${route.name.toLowerCase()}`}
            >
              <Ionicons
                name={(icons[route.name]?.[isFocused ? 'active' : 'inactive'] as IconName) ?? 'ellipse'}
                size={26}
                color={isFocused ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label as string}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(17,24,24,0.95)', // matches Flow-pilot nav background
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  label: {
    fontSize: 10,
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
  },
});

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icons: Record<string, IconName> = {
  Today: 'sunny-outline',
  Inbox: 'archive-outline',
  Plan: 'calendar-outline',
  Focus: 'timer-outline',
  Settings: 'settings-outline',
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' ? { intensity: 30, tint: 'dark' as const } : {};
  return (
    <Container
      {...containerProps}
      style={styles.container}
    >
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
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons name={icons[route.name] ?? 'ellipse'} size={18} color={isFocused ? theme.colors.primary : theme.colors.textMuted} />
              </View>
              <Text style={[styles.label, { color: isFocused ? theme.colors.primary : theme.colors.textMuted }]}>
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
    left: 16,
    right: 16,
    bottom: 18,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Slightly translucent base to simulate glass tab bar.
    backgroundColor: 'rgba(17,24,24,0.86)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabActive: {},
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    // Subtle highlight behind active icon.
    backgroundColor: 'rgba(28,46,46,0.9)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
  },
});

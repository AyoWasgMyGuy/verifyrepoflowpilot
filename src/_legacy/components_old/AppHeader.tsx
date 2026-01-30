import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconCircleButton } from './IconCircleButton';
import { theme } from '../styles/theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  avatarLabel?: string;
  rightIcon?: React.ComponentProps<typeof IconCircleButton>['icon'];
  onRightPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  avatarLabel = 'FP',
  rightIcon = 'notifications-outline',
  onRightPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {onRightPress ? <IconCircleButton icon={rightIcon} onPress={onRightPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 14,
  },
  textBlock: {
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.headline,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.text.small,
  },
});

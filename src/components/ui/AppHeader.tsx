import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../styles/theme';
import { IconButton } from './IconButton';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  avatarLabel?: string;
  rightIcon?: React.ComponentProps<typeof IconButton>['icon'];
  onRightPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  avatarLabel = 'FP',
  rightIcon = 'ellipsis-horizontal',
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
      {onRightPress ? <IconButton icon={rightIcon} onPress={onRightPress} /> : null}
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
    fontSize: theme.text.body,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  textBlock: {
    gap: 2,
  },
  title: {
    fontSize: theme.text.headline,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.text.small,
    fontFamily: theme.fonts.body,
    color: theme.colors.textMuted,
  },
});

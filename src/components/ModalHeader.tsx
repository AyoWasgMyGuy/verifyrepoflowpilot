import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

type ModalHeaderProps = {
  title: string;
  onClose: () => void;
};

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.text.headline,
    fontFamily: theme.fonts.display,
    color: theme.colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

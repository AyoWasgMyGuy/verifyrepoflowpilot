import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../components/ui/BottomSheet';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { IconButton } from '../components/ui/IconButton';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BrainDump'>;

export function BrainDumpModal({ navigation }: Props) {
  const [text, setText] = useState('');

  const handleParse = () => {
    const items = text
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (items.length === 0) {
      Alert.alert('Add a thought', 'Type a few ideas or tasks first.');
      return;
    }

    setText('');
    navigation.navigate('Review', { items });
  };

  return (
    <BottomSheet visible onClose={() => navigation.goBack()} height={560}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Brain Dump</Text>
          <Text style={styles.subtitle}>Everything on your mind, in one place.</Text>
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="What's on your mind?"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            textAlignVertical="top"
          />
          <View style={styles.micButton}>
            <Ionicons name="mic" size={18} color={theme.colors.text} />
          </View>
        </View>

        <View style={styles.actions}>
          <IconButton icon="mic-outline" onPress={() => console.log('[brain] mic placeholder')} />
          <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} />
        </View>

        <PrimaryButton label="Turn into tasks" onPress={handleParse} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
  },
  header: {
    gap: 4,
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
  inputWrap: {
    position: 'relative',
  },
  input: {
    minHeight: 180,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  micButton: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../components/BottomSheet';
import { IconCircleButton } from '../components/IconCircleButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
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
    <BottomSheet visible onClose={() => navigation.goBack()} height={600}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={18} color={theme.colors.bg} />
        </View>
        <View>
          <Text style={styles.headerTitle}>FlowPilot</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <IconCircleButton icon="close" onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Brain Dump</Text>
        <Text style={styles.subtitle}>Dump tasks or thoughts and we'll organize them.</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          textAlignVertical="top"
        />
        <View style={styles.actions}>
          <IconCircleButton icon="mic-outline" onPress={() => console.log('[brain] mic placeholder')} />
          <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} />
        </View>
        <PrimaryButton label="Turn into tasks" onPress={handleParse} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: theme.text.body,
  },
  headerStatus: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    gap: theme.spacing.lg,
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
  input: {
    minHeight: 180,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

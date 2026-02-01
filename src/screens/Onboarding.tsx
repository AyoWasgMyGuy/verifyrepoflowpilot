import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type GoalKey = 'homework' | 'work' | 'personal';

export function OnboardingScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalKey | null>(null);

  const handleContinue = () => {
    navigation.navigate('Onboarding2', { displayName: name.trim() || 'Guest', goal: goal ?? undefined });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.progressHeader}>
          <View style={styles.progressRow}>
            <Text style={styles.stepText}>Step 1 of 2</Text>
            <Text style={styles.stepBadge}>50%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroBlock}>
            <Text style={styles.heroTitle}>
              Let's set{'\n'} <Text style={styles.heroAccent}>the stage.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>Personalize your space to find your flow.</Text>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>What's your name?</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Type your name..."
                placeholderTextColor="rgba(231,245,245,0.3)"
                style={styles.nameInput}
              />
              <Ionicons name="create-outline" size={18} color={theme.colors.primary} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.goalBlock}>
            <Text style={styles.goalTitle}>What would make today feel successful?</Text>
            <Pressable
              style={[styles.goalCardWide, goal === 'homework' && styles.goalCardActive]}
              onPress={() => setGoal('homework')}
            >
              <View style={[styles.goalIconWrap, goal === 'homework' && styles.goalIconActive]}>
                <Ionicons name="school-outline" size={20} color={goal === 'homework' ? theme.colors.bg : theme.colors.text} />
              </View>
              <View>
                <Text style={styles.goalCardTitle}>Finish homework</Text>
                <Text style={styles.goalCardSubtitle}>Clear the academic deck</Text>
              </View>
            </Pressable>

            <View style={styles.goalRow}>
              <Pressable
                style={[styles.goalCardSmall, goal === 'work' && styles.goalCardActive]}
                onPress={() => setGoal('work')}
              >
                <View style={[styles.goalIconWrapSmall, goal === 'work' && styles.goalIconActive]}>
                  <Ionicons name="briefcase-outline" size={18} color={goal === 'work' ? theme.colors.bg : theme.colors.text} />
                </View>
                <Text style={styles.goalSmallTitle}>Work tasks</Text>
              </Pressable>

              <Pressable
                style={[styles.goalCardSmall, goal === 'personal' && styles.goalCardActive]}
                onPress={() => setGoal('personal')}
              >
                <View style={[styles.goalIconWrapSmall, goal === 'personal' && styles.goalIconActive]}>
                  <Ionicons name="leaf-outline" size={18} color={goal === 'personal' ? theme.colors.bg : theme.colors.text} />
                </View>
                <Text style={styles.goalSmallTitle}>Personal balance</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomDock}>
          <Pressable style={styles.ctaButton} onPress={handleContinue}>
            <Text style={styles.ctaText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.bg} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  progressHeader: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  stepText: {
    color: 'rgba(231,245,245,0.6)',
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  stepBadge: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(19,236,236,0.12)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroBlock: {
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 34,
    lineHeight: 38,
  },
  heroAccent: {
    color: theme.colors.primary,
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(231,245,245,0.5)',
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  inputBlock: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 6,
  },
  nameInput: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 24,
    paddingVertical: 4,
  },
  inputIcon: {
    marginBottom: 4,
  },
  goalBlock: {
    gap: theme.spacing.md,
  },
  goalTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 18,
  },
  goalCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  goalCardActive: {
    borderColor: 'rgba(19,236,236,0.5)',
    backgroundColor: 'rgba(19,236,236,0.12)',
  },
  goalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  goalIconWrapSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  goalIconActive: {
    backgroundColor: theme.colors.primary,
  },
  goalCardTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 17,
  },
  goalCardSubtitle: {
    color: 'rgba(231,245,245,0.4)',
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  goalRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  goalCardSmall: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  goalSmallTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 15,
    marginTop: theme.spacing.sm,
  },
  bottomDock: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  ctaButton: {
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
    fontSize: 16,
  },
});

import React from 'react';
import { ScrollView, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll = false, style, contentStyle }: ScreenProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(19,236,236,0.16)', 'rgba(16,34,34,0.0)']}
        style={styles.orbPrimary}
      />
      <LinearGradient
        colors={['rgba(139,92,246,0.18)', 'rgba(16,34,34,0.0)']}
        style={styles.orbAccent}
      />
      <SafeAreaView style={[styles.safe, style]}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, contentStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  orbPrimary: {
    position: 'absolute',
    top: -160,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  orbAccent: {
    position: 'absolute',
    bottom: -180,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
});

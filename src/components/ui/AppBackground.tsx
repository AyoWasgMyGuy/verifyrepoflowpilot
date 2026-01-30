import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

type AppBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'soft' | 'bold';
};

export function AppBackground({ children, style, intensity = 'soft' }: AppBackgroundProps) {
  const orbOpacity = intensity === 'bold' ? 0.45 : 0.28;
  return (
    <View style={[styles.container, style]}>
      {/* Intentional RGBA gradients for ambient glow orbs. */}
      <LinearGradient
        colors={['rgba(19,236,236,0.16)', 'rgba(16,34,34,0.0)']}
        style={[styles.orbPrimary, { opacity: orbOpacity }]}
      />
      <LinearGradient
        colors={['rgba(139,92,246,0.18)', 'rgba(16,34,34,0.0)']}
        style={[styles.orbAccent, { opacity: orbOpacity }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  orbPrimary: {
    position: 'absolute',
    top: -140,
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

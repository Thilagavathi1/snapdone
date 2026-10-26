import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md' }) => {
  const d = {
    sm: { outer: 40, inner: 40, radius: 12, scan: 26, check: 15 },
    md: { outer: 56, inner: 46, radius: 16, scan: 30, check: 18 },
    lg: { outer: 96, inner: 78, radius: 26, scan: 50, check: 28 },
  }[size];
  const framed = size !== 'sm';

  return (
    <View
      style={[
        styles.outer,
        { width: d.outer, height: d.outer, borderRadius: d.radius },
        size === 'lg' && styles.glow,
      ]}
    >
      <View
        style={[
          styles.inner,
          framed && styles.innerFramed,
          { width: d.inner, height: d.inner, borderRadius: d.radius - 4 },
        ]}
      >
        {/* Viewfinder brackets with a check in the middle */}
        <Ionicons name="scan-outline" size={d.scan} color={colors.primary} />
        <Ionicons name="checkmark" size={d.check} color={colors.secondary} style={styles.check} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.neutralSurfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralSurface,
  },
  innerFramed: {
    borderWidth: 1.5,
    borderColor: colors.borderBright,
  },
  check: {
    position: 'absolute',
  },
});

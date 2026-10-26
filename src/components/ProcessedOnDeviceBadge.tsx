import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/theme/colors';

/** Shown wherever AI output is displayed. */
export const ProcessedOnDeviceBadge: React.FC<{ label?: string }> = ({ label = copy.privacy.processedOnDevice }) => (
  <View style={styles.badge}>
    <Ionicons name="hardware-chip-outline" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.secondary,
  },
});

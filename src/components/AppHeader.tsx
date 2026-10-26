import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme/colors';
import { AppLogo } from '@/components/AppLogo';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface AppHeaderProps {
  /** Shown after "SnapDone •". Ignored when `title` is set. */
  section?: string;
  /** Replaces the "SnapDone • section" title entirely. */
  title?: string;
  tag?: { icon: IconName; label: string };
  onBack?: () => void;
  onProfilePress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  section,
  title,
  tag = { icon: 'shield-checkmark-outline', label: 'ON-DEVICE AI' },
  onBack,
  onProfilePress,
}) => (
  <View style={styles.row}>
    <View style={styles.brandRow}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={10} style={styles.backButton} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
      )}
      <AppLogo size="sm" />
      <View style={styles.titleCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title ?? (
            <>
              SnapDone <Text style={styles.section}>• {section}</Text>
            </>
          )}
        </Text>
        <View style={styles.tag}>
          <Ionicons name={tag.icon} size={13} color={colors.secondary} style={{ marginRight: 4 }} />
          <Text style={styles.tagText}>{tag.label}</Text>
        </View>
      </View>
    </View>

    <Pressable style={styles.avatar} onPress={onProfilePress} accessibilityLabel="Settings">
      <Ionicons name="person-outline" size={20} color={colors.onPrimaryContainer} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  backButton: {
    marginRight: 10,
  },
  titleCol: {
    marginLeft: 10,
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  section: {
    fontFamily: fonts.regular,
    color: colors.primarySoft,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.secondary,
    letterSpacing: 0.4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

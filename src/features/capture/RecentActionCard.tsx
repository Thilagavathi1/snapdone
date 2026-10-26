import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryCopy } from '@/constants/copy';
import { categoryTile, confirmationLine, statusBadge, summaryLine } from '@/features/history/actionDisplay';
import { colors, fonts, layout } from '@/theme/colors';
import type { ActionRecord } from '@/types/action';
import { formatRelativeDay } from '@/utils/dates';

interface RecentActionCardProps {
  record: ActionRecord;
  onToggleArchive: () => void;
  onMore: () => void;
}

export const RecentActionCard: React.FC<RecentActionCardProps> = ({ record, onToggleArchive, onMore }) => {
  const badge = statusBadge(record);
  const tile = categoryTile[record.category];
  const summary = summaryLine(record);
  const confirmation = confirmationLine(record);
  const isArchived = record.status === 'archived';
  const isAppointment = record.category === 'appointment';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.categoryPill, isAppointment && styles.appointmentPill]}>
          <Text style={[styles.categoryText, isAppointment && { color: colors.onPrimaryContainer }]}>
            {categoryCopy[record.category]}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatRelativeDay(record.createdAt)}</Text>
        <View style={styles.spacer} />
        <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon} size={14} color={badge.color} style={{ marginRight: 5 }} />
          <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {record.imageUri ? (
          <Image source={{ uri: record.imageUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailIcon, { backgroundColor: tile.bg }]}>
            <Ionicons name={tile.icon} size={26} color={tile.color} />
          </View>
        )}
        <View style={styles.detailsCol}>
          <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
          {summary && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.metaText}>{summary}</Text>
            </View>
          )}
          {record.notes && (
            <View style={styles.metaRow}>
              <Ionicons name="document-text-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.metaText} numberOfLines={1}>{record.notes}</Text>
            </View>
          )}
          {confirmation && (
            <View style={styles.metaRow}>
              <Ionicons name="alarm-outline" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.alertText}>{confirmation}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.spacer} />
        <Pressable style={styles.pillButton} onPress={onToggleArchive}>
          <Ionicons
            name={isArchived ? 'arrow-undo-outline' : 'archive-outline'}
            size={15}
            color={colors.textPrimary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.pillButtonText}>{isArchived ? 'Unarchive' : 'Archive'}</Text>
        </Pressable>
        <Pressable style={styles.moreButton} onPress={onMore} accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutralSurface,
    borderRadius: layout.cardRadius,
    padding: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: colors.neutralSurfaceActive,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  appointmentPill: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  timestamp: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: colors.neutralSurfaceActive,
  },
  thumbnailIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  metaText: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  alertText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurfaceActive,
    paddingHorizontal: 14,
    minHeight: layout.minTouchTarget,
    borderRadius: 22,
  },
  pillButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  moreButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: 22,
    backgroundColor: colors.neutralSurfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

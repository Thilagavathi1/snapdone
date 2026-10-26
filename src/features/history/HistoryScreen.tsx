import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { Skeleton } from '@/components/Skeleton';
import { StateCard } from '@/components/StateCard';
import { copy } from '@/constants/copy';
import { useScreenshotPicker } from '@/features/capture/useScreenshotPicker';
import { useHistoryStore } from '@/store/historyStore';
import { colors, fonts, layout } from '@/theme/colors';
import type { ActionCategory, ActionRecord } from '@/types/action';
import { categoryTile, statusBadge, summaryLine } from './actionDisplay';
import { useActionMenu } from './useActionMenu';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const filters: { key: ActionCategory | 'all'; label: string; icon: IconName }[] = [
  { key: 'all', label: 'All', icon: 'albums-outline' },
  { key: 'bill', label: 'Bills', icon: 'receipt-outline' },
  { key: 'appointment', label: 'Appointments', icon: 'calendar-outline' },
  { key: 'delivery', label: 'Deliveries', icon: 'car-outline' },
  { key: 'task', label: 'Tasks', icon: 'checkbox-outline' },
];

const matches = (record: ActionRecord, query: string) =>
  [record.title, record.amount, record.notes, record.ocrText].some((s) => s?.toLowerCase().includes(query));

export const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { pickFromLibrary } = useScreenshotPicker();
  const { toggleArchive, showMenu } = useActionMenu();
  const status = useHistoryStore((s) => s.status);
  const items = useHistoryStore((s) => s.items);
  const load = useHistoryStore((s) => s.load);
  const [filter, setFilter] = useState<ActionCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  const q = query.trim().toLowerCase();
  const visible = items.filter((i) => (filter === 'all' || i.category === filter) && (!q || matches(i, q)));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const completedThisMonth = items.filter((i) => i.status !== 'needs_review' && i.createdAt >= monthStart).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.padded}>
        <AppHeader section="History" />

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>{copy.history.title}</Text>
            <Text style={styles.pageSubtitle}>{copy.history.subtitle}</Text>
          </View>
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle-outline" size={17} color={colors.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.completedText}>{completedThisMonth} completed this month</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color={colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={copy.history.search}
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search history"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={f.icon}
                size={18}
                color={active ? colors.onPrimaryContainer : colors.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.padded}>
        {(status === 'idle' || status === 'loading') && (
          <View style={{ gap: layout.cardGap }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={104} radius={layout.cardRadius} />
            ))}
          </View>
        )}

        {status === 'error' && (
          <StateCard
            icon="alert-circle-outline"
            tone="error"
            title={copy.history.loadError}
            action={{ label: copy.history.retry, icon: 'refresh', onPress: load }}
          />
        )}

        {status === 'ready' && items.length === 0 && (
          <StateCard
            icon="sparkles-outline"
            title={copy.history.emptyTitle}
            body={copy.history.emptyBody}
            action={{ label: copy.history.selectScreenshot, icon: 'image-outline', onPress: pickFromLibrary }}
          />
        )}

        {status === 'ready' && items.length > 0 && visible.length === 0 && (
          <Text style={styles.noResults}>{copy.history.noMatches}</Text>
        )}

        {status === 'ready' &&
          visible.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onPress={() => showMenu(record)}
              onLongPress={() => toggleArchive(record)}
            />
          ))}

        {status === 'ready' && items.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <StateCard
              icon="sparkles-outline"
              title="Got another screenshot?"
              body="Choose a screenshot to auto-detect bills, tickets, reservations, or chores."
              action={{ label: copy.history.selectScreenshot, icon: 'image-outline', onPress: pickFromLibrary }}
            />
          </View>
        )}

        <View style={styles.footerRow}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.secondary} style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>{copy.history.footer}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const HistoryCard: React.FC<{ record: ActionRecord; onPress: () => void; onLongPress: () => void }> = ({
  record,
  onPress,
  onLongPress,
}) => {
  const tile = categoryTile[record.category];
  const badge = statusBadge(record);
  const summary = summaryLine(record);

  return (
    <Pressable
      style={[styles.itemCard, record.status === 'archived' && { opacity: 0.7 }]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityHint="Tap for options, long press to archive"
    >
      {record.imageUri ? (
        <Image source={{ uri: record.imageUri }} style={styles.itemTile} resizeMode="cover" />
      ) : (
        <View style={[styles.itemTile, { backgroundColor: tile.bg }]}>
          <Ionicons name={tile.icon} size={28} color={tile.color} />
        </View>
      )}
      <View style={styles.itemBody}>
        <View style={styles.itemHeaderRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{record.title}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={13} color={badge.color} style={{ marginRight: 5 }} />
            <Text style={[styles.badgeText, { color: badge.color }]} numberOfLines={1}>{badge.label}</Text>
          </View>
        </View>
        {summary && <Text style={styles.itemMeta} numberOfLines={1}>{summary}</Text>}
        <View style={styles.footnoteRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.footnoteText} numberOfLines={1}>
            {copy.privacy.processedOnDevice} · {Math.round(record.confidence * 100)}% confident
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 18,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    marginLeft: 8,
    flexShrink: 1,
  },
  completedText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.secondary,
    flexShrink: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurfaceActive,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterRow: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
    marginBottom: 18,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurfaceActive,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
  },
  filterText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterTextActive: {
    color: colors.onPrimaryContainer,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurface,
    borderRadius: layout.cardRadius,
    padding: 18,
    marginBottom: layout.cardGap,
  },
  itemTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemBody: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '55%',
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
  },
  itemMeta: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footnoteText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  noResults: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { Skeleton } from '@/components/Skeleton';
import { StateCard } from '@/components/StateCard';
import { copy } from '@/constants/copy';
import { useActionMenu } from '@/features/history/useActionMenu';
import { useIsOffline } from '@/hooks/useIsOffline';
import { useHistoryStore } from '@/store/historyStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, fonts, layout } from '@/theme/colors';
import { ModelDownloadCard } from './ModelDownloadCard';
import { RecentActionCard } from './RecentActionCard';
import { useScreenshotPicker } from './useScreenshotPicker';

const RECENT_COUNT = 3;

interface HomeScreenProps {
  onViewAll: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onViewAll, onOpenSettings }) => {
  const insets = useSafeAreaInsets();
  const offline = useIsOffline();
  const demoMode = useSettingsStore((s) => s.demoMode);
  const { pickFromLibrary, takePhoto } = useScreenshotPicker();
  const { toggleArchive, showMenu } = useActionMenu();
  const status = useHistoryStore((s) => s.status);
  const items = useHistoryStore((s) => s.items);
  const load = useHistoryStore((s) => s.load);

  useEffect(() => {
    if (status === 'idle') void load();
  }, [status, load]);

  const recent = items.filter((i) => i.status !== 'archived').slice(0, RECENT_COUNT);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader section="Home" onProfilePress={onOpenSettings} />

      {/* Status bar */}
      <View style={styles.statusRow}>
        <View style={styles.liveDotRing}>
          <View style={styles.liveDot} />
        </View>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.secondary} style={{ marginRight: 6 }} />
        <Text style={styles.statusActiveText}>{copy.privacy.onDeviceAi}</Text>
        <View style={{ flex: 1 }} />
        <View style={[styles.vaultPill, offline && styles.offlinePill]}>
          {offline && <Ionicons name="cloud-offline-outline" size={13} color={colors.tertiary} style={{ marginRight: 4 }} />}
          <Text style={[styles.vaultText, offline && { color: colors.tertiary }]}>
            {offline ? copy.privacy.offline : copy.privacy.offlineVault}
          </Text>
        </View>
      </View>

      {!demoMode && <ModelDownloadCard />}

      {/* Choose Screenshot */}
      <LinearGradient
        colors={['rgba(124, 108, 255, 0.22)', colors.neutralSurface]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.6 }}
        style={styles.heroCard}
      >
        <View style={styles.heroCardHeader}>
          <Text style={styles.heroCardTitle}>{copy.home.chooseTitle}</Text>
          <Ionicons name="sparkles-outline" size={26} color={colors.primarySoft} />
        </View>
        <Text style={styles.heroCardSubtitle}>{copy.home.chooseSubtitle}</Text>

        <Pressable style={styles.dropZone} onPress={pickFromLibrary} accessibilityRole="button">
          <View style={styles.dropZoneIconCircle}>
            <Ionicons name="image-outline" size={26} color={colors.primarySoft} />
          </View>
          <Text style={styles.dropZoneTitle}>{copy.home.dropTitle}</Text>
          <Text style={styles.dropZoneSubtitle}>{copy.home.dropSubtitle}</Text>
        </Pressable>

        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.openPhotosBtn} onPress={pickFromLibrary} accessibilityRole="button">
            <Ionicons name="images-outline" size={20} color={colors.onPrimaryContainer} style={{ marginRight: 8 }} />
            <Text style={styles.openPhotosText}>{copy.home.openPhotos}</Text>
          </Pressable>

          <Pressable style={styles.scanBtn} onPress={takePhoto} accessibilityRole="button">
            <Ionicons name="camera-outline" size={22} color={colors.textPrimary} style={{ marginRight: 10 }} />
            <Text style={styles.scanText}>{copy.home.takePhoto}</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Recent actions */}
      <View style={styles.recentSectionHeader}>
        <View style={styles.recentTitleGroup}>
          <Text style={styles.recentTitle}>{copy.home.recent}</Text>
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>{recent.length}</Text>
          </View>
        </View>
        <Pressable hitSlop={12} onPress={onViewAll}>
          <Text style={styles.viewAllText}>{copy.home.viewAll}</Text>
        </Pressable>
      </View>

      {(status === 'idle' || status === 'loading') && (
        <View style={{ gap: layout.cardGap }}>
          <Skeleton height={150} radius={layout.cardRadius} />
          <Skeleton height={150} radius={layout.cardRadius} />
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
      {status === 'ready' && recent.length === 0 && (
        <StateCard icon="sparkles-outline" title={copy.history.emptyTitle} body={copy.history.emptyBody} />
      )}
      {status === 'ready' &&
        recent.map((record) => (
          <RecentActionCard
            key={record.id}
            record={record}
            onToggleArchive={() => toggleArchive(record)}
            onMore={() => showMenu(record)}
          />
        ))}

      <View style={styles.securityNoticeRow}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.secondary} style={{ marginRight: 12 }} />
        <Text style={styles.securityNoticeText}>{copy.home.ramNotice}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurface,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  liveDotRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.secondary,
  },
  statusActiveText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.secondary,
  },
  vaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralSurfaceActive,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offlinePill: {
    backgroundColor: colors.tertiaryMuted,
  },
  vaultText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  heroCard: {
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroCardTitle: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  heroCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  dropZone: {
    backgroundColor: colors.neutralBackground,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginBottom: 22,
  },
  dropZoneIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutralSurfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dropZoneTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dropZoneSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  openPhotosBtn: {
    flex: 1,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openPhotosText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  scanBtn: {
    flex: 1,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.neutralSurfaceActive,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentTitle: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.textPrimary,
    marginRight: 10,
    letterSpacing: -0.4,
  },
  recentBadge: {
    backgroundColor: colors.neutralSurfaceActive,
    borderRadius: 13,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.primarySoft,
  },
  securityNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 30,
  },
  securityNoticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});

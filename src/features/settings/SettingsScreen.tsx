import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { ProcessedOnDeviceBadge } from '@/components/ProcessedOnDeviceBadge';
import { onboardingFlag } from '@/features/onboarding/onboardingFlag';
import { getServices } from '@/services';
import { GEMMA_MODEL } from '@/services/ai/gemmaModelFile';
import { useHistoryStore } from '@/store/historyStore';
import { useModelStore } from '@/store/modelStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, fonts, layout } from '@/theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsScreenProps {
  onShowOnboarding: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onShowOnboarding }) => {
  const insets = useSafeAreaInsets();
  const clear = useHistoryStore((s) => s.clear);
  const count = useHistoryStore((s) => s.items.length);
  const modelStatus = useModelStore((s) => s.status);
  const modelProgress = useModelStore((s) => s.progress);
  const downloadModel = useModelStore((s) => s.download);
  const removeModel = useModelStore((s) => s.remove);
  const demo = useSettingsStore((s) => s.demoMode);
  const toggleDemo = useSettingsStore((s) => s.setDemoMode);
  const { ai, ocr } = getServices();

  const modelValue =
    modelStatus === 'ready'
      ? 'On this phone'
      : modelStatus === 'downloading'
        ? `${Math.round(modelProgress * 100)}%`
        : `Download · ${Math.round(GEMMA_MODEL.sizeBytes / 1e6)} MB`;

  const onModelPress = () => {
    if (modelStatus === 'missing' || modelStatus === 'error') {
      void downloadModel();
    } else if (modelStatus === 'ready') {
      Alert.alert(`Delete ${GEMMA_MODEL.name}?`, 'Frees storage. You will need to download it again to read screenshots.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void removeModel() },
      ]);
    }
  };

  const confirmClear = () =>
    Alert.alert('Clear history?', 'Deletes every saved action and its screenshot from this device, and cancels their alerts.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clear().catch((e) => Alert.alert("Couldn't clear history", String(e))),
      },
    ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader section="Settings" />
      <Text style={styles.pageTitle}>Settings</Text>

      <Text style={styles.sectionLabel}>ON-DEVICE AI</Text>
      <View style={styles.card}>
        <Row icon="hardware-chip-outline" iconColor={colors.secondary} title="Language model" value={ai.modelName} />
        <Divider />
        <Row icon="scan-outline" iconColor={colors.primarySoft} title="Text recognition" value={ocr.name} />
        <Divider />
        <Row
          icon="cloud-download-outline"
          iconColor={colors.secondary}
          title={`${GEMMA_MODEL.name} model`}
          value={modelValue}
          onPress={modelStatus === 'downloading' ? undefined : onModelPress}
        />
        <Divider />
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="flask-outline" size={20} color={colors.tertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Demo mode</Text>
            <Text style={styles.rowHint}>Use a sample bill instead of reading screenshots</Text>
          </View>
          <Switch
            value={demo}
            onValueChange={toggleDemo}
            trackColor={{ true: colors.primary, false: colors.neutralSurfaceActive }}
            accessibilityLabel="Demo mode"
          />
        </View>
        <Divider />
        <View style={styles.badgeRow}>
          <ProcessedOnDeviceBadge label="No data leaves this phone" />
        </View>
      </View>

      <Text style={styles.sectionLabel}>DATA</Text>
      <View style={styles.card}>
        <Row
          icon="trash-outline"
          iconColor={colors.danger}
          title="Clear history"
          value={`${count} saved`}
          onPress={confirmClear}
          disabled={count === 0}
        />
        <Divider />
        <Row
          icon="sparkles-outline"
          iconColor={colors.tertiary}
          title="Show onboarding again"
          onPress={() => {
            onboardingFlag.reset();
            onShowOnboarding();
          }}
        />
      </View>

      <Text style={styles.footer}>
        SnapDone keeps screenshots, extracted text and history in a local database on this device. There is no account,
        cloud sync or analytics.
      </Text>
    </ScrollView>
  );
};

const Divider = () => <View style={styles.divider} />;

interface RowProps {
  icon: IconName;
  iconColor: string;
  title: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, iconColor, title, value, onPress, disabled }) => (
  <Pressable
    style={[styles.row, disabled && { opacity: 0.5 }]}
    onPress={onPress}
    disabled={!onPress || disabled}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <View style={styles.rowIcon}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.rowTitle}>{title}</Text>
    {value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
    {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 6 }} />}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 32,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.neutralSurface,
    borderRadius: layout.cardRadius,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 8,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.neutralSurfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowHint: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rowValue: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    maxWidth: '45%',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDefault,
    marginLeft: 48,
  },
  badgeRow: {
    paddingVertical: 14,
  },
  footer: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});

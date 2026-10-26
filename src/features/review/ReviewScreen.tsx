import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  type KeyboardTypeOptions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { DateTimeField } from '@/components/DateTimeField';
import { ProcessedOnDeviceBadge } from '@/components/ProcessedOnDeviceBadge';
import { Skeleton } from '@/components/Skeleton';
import { StateCard } from '@/components/StateCard';
import { actionTypeCopy, copy } from '@/constants/copy';
import { DraftError } from '@/features/actions/actionService';
import { useScreenshotPicker } from '@/features/capture/useScreenshotPicker';
import { getServices } from '@/services';
import { useCaptureStore } from '@/store/captureStore';
import { colors, fonts, layout } from '@/theme/colors';
import type { ActionType } from '@/types/action';
import { formatLongDate, formatShortDate, formatTime, partOfDay } from '@/utils/dates';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const actionTypes: { key: ActionType; icon: IconName }[] = [
  { key: 'reminder', icon: 'alarm-outline' },
  { key: 'calendar_event', icon: 'calendar-outline' },
  { key: 'task', icon: 'checkmark-circle-outline' },
];

interface ReviewScreenProps {
  onBack: () => void;
  onCreated: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onBack, onCreated }) => {
  const insets = useSafeAreaInsets();
  const { pickFromLibrary } = useScreenshotPicker({ openReview: false });
  const phase = useCaptureStore((s) => s.phase);
  const imageUri = useCaptureStore((s) => s.imageUri);
  const fileName = useCaptureStore((s) => s.fileName);
  const draft = useCaptureStore((s) => s.draft);
  const confidence = useCaptureStore((s) => s.confidence);
  const durationMs = useCaptureStore((s) => s.durationMs);
  const failureReason = useCaptureStore((s) => s.failureReason);
  const saving = useCaptureStore((s) => s.saving);
  const updateDraft = useCaptureStore((s) => s.updateDraft);
  const enterManually = useCaptureStore((s) => s.enterManually);
  const confirm = useCaptureStore((s) => s.confirm);

  const editing = useCaptureStore((s) => s.editing);
  const setEditing = useCaptureStore((s) => s.setEditing);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const processing = phase === 'reading' || phase === 'extracting';
  const hasResult = phase === 'ready' || phase === 'needs_review';
  const { ai, ocr } = getServices();
  const modelName = ai.modelName;

  const handleConfirm = async () => {
    try {
      await confirm();
      onCreated();
    } catch (e) {
      if (e instanceof DraftError) setEditing(true);
      Alert.alert(`Couldn't ${actionTypeCopy[draft.actionType].cta.toLowerCase()}`, e instanceof Error ? e.message : undefined);
    }
  };

  if (phase === 'idle') {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <StateCard
          icon="image-outline"
          title={copy.review.noImageTitle}
          body={copy.review.noImageBody}
          action={{ label: copy.review.backHome, icon: 'home-outline', onPress: onBack }}
        />
      </View>
    );
  }

  const filledCount = [draft.title, draft.dueDate, draft.time, draft.amount, draft.notes].filter(Boolean).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader
        title={copy.review.screenTitle}
        tag={{ icon: 'lock-closed-outline', label: copy.review.sandbox }}
        onBack={onBack}
      />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="robot-outline" size={26} color={colors.primarySoft} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Review Details</Text>
        </View>
        <View style={[styles.pill, styles.greenPill]}>
          <Ionicons name="hardware-chip-outline" size={15} color={colors.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.greenPillText} numberOfLines={1}>Local {modelName}</Text>
        </View>
      </View>

      {ocr.isMock && (
        <View style={styles.demoBanner}>
          <Ionicons name="flask-outline" size={18} color={colors.tertiary} style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.demoBannerText}>{copy.review.demoMode}</Text>
        </View>
      )}

      {/* Screenshot + extraction summary */}
      <LinearGradient
        colors={[colors.neutralSurfaceActive, colors.neutralSurface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={styles.extractCard}
      >
        <Pressable style={styles.fileRow} onPress={() => setPreviewExpanded((v) => !v)}>
          <Ionicons name="receipt-outline" size={22} color={colors.textSecondary} style={{ marginRight: 12 }} />
          <Text style={styles.fileName} numberOfLines={1}>{fileName ?? 'Screenshot'}</Text>
          <Text style={styles.zoomHint}>{previewExpanded ? 'Tap to\nshrink' : 'Tap image to\nzoom'}</Text>
        </Pressable>
        {imageUri && (
          <Pressable onPress={() => setPreviewExpanded((v) => !v)}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.preview, previewExpanded && styles.previewExpanded]}
              resizeMode="contain"
              accessibilityLabel="Selected screenshot"
            />
          </Pressable>
        )}

        <View style={styles.extractBody}>
          {processing && (
            <>
              <View style={styles.tileRow}>
                <Skeleton height={76} radius={14} style={{ flex: 1 }} />
                <Skeleton height={76} radius={14} style={{ flex: 1 }} />
              </View>
              <View style={styles.entityRow}>
                <ActivityIndicator size="small" color={colors.secondary} style={{ marginRight: 10 }} />
                <Text style={styles.entityText}>
                  {phase === 'reading' ? copy.review.readingText : copy.review.gemmaReading}
                </Text>
              </View>
            </>
          )}

          {phase === 'ready' && (
            <>
              <View style={styles.tileRow}>
                <View style={[styles.valueTile, styles.dueTile]}>
                  <View style={styles.valueTileHeader}>
                    <Text style={styles.valueLabel}>Due Date</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.secondary} />
                  </View>
                  <Text style={[styles.valueText, { color: colors.secondary }]}>
                    {formatShortDate(draft.dueDate) ?? '—'}
                  </Text>
                </View>
                <View style={styles.valueTile}>
                  <View style={styles.valueTileHeader}>
                    <Text style={styles.valueLabel}>Amount</Text>
                    <Ionicons name="sparkles-outline" size={18} color={colors.primarySoft} />
                  </View>
                  <Text style={[styles.valueText, { color: colors.primarySoft }]}>{draft.amount || '—'}</Text>
                </View>
              </View>
              <View style={styles.entityRow}>
                <Ionicons name="hardware-chip-outline" size={17} color={colors.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.entityText}>
                  {filledCount} details identified on-device in {durationMs}ms
                </Text>
              </View>
            </>
          )}

          {phase === 'needs_review' && (
            <View style={styles.reviewBanner}>
              <Ionicons name="clipboard-outline" size={20} color={colors.tertiary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewBannerTitle}>{copy.review.needsReviewTitle}</Text>
                <Text style={styles.reviewBannerBody}>{copy.review.needsReviewBody}</Text>
                {failureReason && <Text style={styles.reviewBannerReason}>{failureReason}</Text>}
              </View>
            </View>
          )}

          {phase === 'ocr_failed' && (
            <View style={styles.reviewBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.danger} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewBannerTitle, { color: colors.danger }]}>{copy.review.ocrFailedTitle}</Text>
                {failureReason && <Text style={styles.reviewBannerBody}>{failureReason}</Text>}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {phase === 'ocr_failed' && (
        <>
          <Pressable style={styles.primaryButton} onPress={pickFromLibrary}>
            <Ionicons name="images-outline" size={20} color={colors.onPrimaryContainer} style={{ marginRight: 10 }} />
            <Text style={styles.primaryButtonText}>{copy.review.tryAnother}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={enterManually}>
            <Ionicons name="create-outline" size={20} color={colors.textPrimary} style={{ marginRight: 10 }} />
            <Text style={styles.secondaryButtonText}>{copy.review.enterManually}</Text>
          </Pressable>
        </>
      )}

      {(processing || hasResult) && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="brain" size={24} color={colors.textPrimary} style={{ marginRight: 10 }} />
              <Text style={[styles.sectionTitle, { fontSize: 22 }]}>{copy.review.foundDetails}</Text>
            </View>
            {phase === 'ready' && (
              <View style={[styles.pill, confidence >= 0.7 ? styles.greenPill : styles.amberPill]}>
                <Text style={confidence >= 0.7 ? styles.greenPillText : styles.amberPillText}>
                  {Math.round(confidence * 100)}% confident
                </Text>
              </View>
            )}
          </View>
          {phase === 'ready' && (
            <View style={{ marginBottom: 12 }}>
              <ProcessedOnDeviceBadge />
            </View>
          )}
        </>
      )}

      {processing && (
        <View style={{ gap: 10 }}>
          <Skeleton height={46} radius={14} />
          <Skeleton height={86} radius={18} />
          <Skeleton height={86} radius={18} />
          <Skeleton height={86} radius={18} />
        </View>
      )}

      {hasResult && (
        <>
          <View style={styles.segmentRow}>
            {actionTypes.map((t) => {
              const active = t.key === draft.actionType;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => updateDraft({ actionType: t.key })}
                  style={[styles.segment, active && styles.segmentActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={t.icon}
                    size={20}
                    color={active ? colors.onPrimaryContainer : colors.textPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {actionTypeCopy[t.key].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextFieldCard
            label={copy.review.fields.title}
            icon="pencil"
            value={draft.title}
            onChange={(title) => updateDraft({ title })}
            editable={editing}
            large
          />

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1.4 }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{copy.review.fields.date}</Text>
                <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
              </View>
              <DateTimeField
                mode="date"
                value={draft.dueDate}
                display={formatLongDate(draft.dueDate) ?? ''}
                placeholder={copy.review.fields.notSet}
                editable={editing}
                onChange={(dueDate) => updateDraft({ dueDate })}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{copy.review.fields.time}</Text>
                {partOfDay(draft.time) ? (
                  <View style={styles.morningPill}>
                    <Text style={styles.morningPillText}>{partOfDay(draft.time)}</Text>
                  </View>
                ) : (
                  <Ionicons name="time-outline" size={18} color={colors.secondary} />
                )}
              </View>
              <DateTimeField
                mode="time"
                value={draft.time}
                display={formatTime(draft.time) ?? ''}
                placeholder={copy.review.fields.notSet}
                editable={editing}
                onChange={(time) => updateDraft({ time })}
              />
            </View>
          </View>

          <TextFieldCard
            label={copy.review.fields.amount}
            icon="cash-outline"
            value={draft.amount}
            onChange={(amount) => updateDraft({ amount })}
            editable={editing}
            placeholder="e.g. ₹2,450"
            keyboardType="default"
          />

          <TextFieldCard
            label={copy.review.fields.notes}
            icon="document-text-outline"
            value={draft.notes}
            onChange={(notes) => updateDraft({ notes })}
            editable={editing}
            multiline
          />

          <Pressable
            style={[styles.primaryButton, saving && { opacity: 0.7 }]}
            onPress={handleConfirm}
            disabled={saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimaryContainer} style={{ marginRight: 10 }} />
            ) : (
              <Ionicons name="notifications-outline" size={20} color={colors.onPrimaryContainer} style={{ marginRight: 10 }} />
            )}
            <Text style={styles.primaryButtonText}>{actionTypeCopy[draft.actionType].cta}</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => setEditing(!editing)} accessibilityRole="button">
            <Ionicons
              name={editing ? 'checkmark' : 'options-outline'}
              size={20}
              color={colors.textPrimary}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.secondaryButtonText}>{editing ? copy.review.doneEditing : copy.review.editManually}</Text>
          </Pressable>
        </>
      )}

      <View style={styles.footerRow}>
        <Ionicons name="lock-closed-outline" size={17} color={colors.secondary} style={{ marginRight: 8 }} />
        <Text style={styles.footerText}>{copy.review.footer}</Text>
      </View>
    </ScrollView>
  );
};

interface TextFieldCardProps {
  label: string;
  icon: IconName;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder?: string;
  large?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

const TextFieldCard: React.FC<TextFieldCardProps> = ({
  label,
  icon,
  value,
  onChange,
  editable,
  placeholder = copy.review.fields.notSet,
  large,
  multiline,
  keyboardType,
}) => (
  <View style={styles.field}>
    <View style={styles.fieldHeader}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Ionicons name={icon} size={18} color={editable ? colors.primarySoft : colors.textSecondary} />
    </View>
    <TextInput
      value={value}
      onChangeText={onChange}
      editable={editable}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, large && styles.inputLarge, editable && styles.inputEditable]}
      accessibilityLabel={label}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    flexShrink: 1,
  },
  greenPill: {
    backgroundColor: colors.secondaryMuted,
  },
  greenPillText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.secondary,
    flexShrink: 1,
  },
  amberPill: {
    backgroundColor: colors.tertiaryMuted,
  },
  amberPillText: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.tertiary,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.tertiaryMuted,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  demoBannerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.tertiaryLight,
    lineHeight: 18,
  },
  extractCard: {
    borderRadius: layout.cardRadius + 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  fileName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  zoomHint: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  preview: {
    height: 180,
    backgroundColor: colors.neutralBackground,
  },
  previewExpanded: {
    height: 460,
  },
  extractBody: {
    padding: 20,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  valueTile: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
  },
  dueTile: {
    backgroundColor: colors.secondaryMuted,
  },
  valueTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  valueLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  valueText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entityText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reviewBannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.tertiary,
    marginBottom: 2,
  },
  reviewBannerBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewBannerReason: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 6,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.neutralSurface,
  },
  segmentActive: {
    backgroundColor: colors.primaryContainer,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  segmentTextActive: {
    color: colors.onPrimaryContainer,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    backgroundColor: colors.neutralSurface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  morningPill: {
    backgroundColor: colors.secondaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  morningPillText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.secondary,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  inputLarge: {
    fontFamily: fonts.semibold,
    fontSize: 22,
  },
  inputEditable: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryMutedBorder,
    paddingBottom: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    marginTop: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 19,
    color: colors.onPrimaryContainer,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.neutralSurface,
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});

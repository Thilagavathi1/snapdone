import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StateCard } from '@/components/StateCard';
import { actionTypeCopy, copy } from '@/constants/copy';
import { useCaptureStore } from '@/store/captureStore';
import { useHistoryStore } from '@/store/historyStore';
import { colors, fonts, layout } from '@/theme/colors';
import type { ActionRecord } from '@/types/action';
import { formatDateTime, formatLongDate, formatTime } from '@/utils/dates';
import { actionService } from './actionService';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function detailRows(record: ActionRecord): { icon: IconName; color: string; label: string; value: string }[] {
  const date = [formatLongDate(record.dueDate), formatTime(record.time)].filter(Boolean).join(' • ');
  const alert = record.alertAt
    ? `${formatDateTime(record.alertAt)}${record.notificationIds.length > 1 ? ' & on the day' : ''}`
    : record.calendarEventId
      ? 'Calendar alert before it starts'
      : 'No alert scheduled';
  const target =
    record.actionType === 'calendar_event' ? 'Your device calendar' : record.actionType === 'task' ? 'SnapDone tasks' : 'SnapDone reminders';

  return [
    { icon: 'calendar-outline', color: colors.primarySoft, label: copy.success.dueDate, value: date || 'No date' },
    { icon: 'notifications-outline', color: colors.tertiary, label: copy.success.alertSchedule, value: alert },
    { icon: 'checkmark-circle-outline', color: colors.secondary, label: copy.success.target, value: target },
  ];
}

interface SuccessScreenProps {
  onViewHistory: () => void;
  onProcessAnother: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onViewHistory, onProcessAnother }) => {
  const insets = useSafeAreaInsets();
  const record = useCaptureStore((s) => s.lastRecord);
  const setLastRecord = useCaptureStore((s) => s.setLastRecord);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  if (!record) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StateCard
          icon="home-outline"
          title={copy.review.noImageTitle}
          action={{ label: copy.review.backHome, onPress: onProcessAnother }}
        />
      </View>
    );
  }

  const typeCopy = actionTypeCopy[record.actionType];
  const inCalendar = !!record.calendarEventId;

  const addToCalendar = async () => {
    setAddingToCalendar(true);
    try {
      const calendarEventId = await actionService.addToCalendar(record);
      const updated = { ...record, calendarEventId };
      setLastRecord(updated);
      useHistoryStore.setState((s) => ({ items: s.items.map((i) => (i.id === record.id ? updated : i)) }));
    } catch (e) {
      Alert.alert("Couldn't add to calendar", e instanceof Error ? e.message : undefined);
    } finally {
      setAddingToCalendar(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.haloOuter}>
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.haloInner}>
            <View style={styles.checkCircle}>
              <View style={styles.checkCore}>
                <Ionicons name="checkmark" size={40} color={colors.secondary} />
              </View>
            </View>
          </Animated.View>
          <View style={[styles.dot, { top: 70, left: 80, backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { top: 44, right: 72, width: 14, height: 14, backgroundColor: colors.secondary }]} />
          <View style={[styles.dot, { bottom: 64, left: 86, backgroundColor: colors.tertiary }]} />
        </View>

        <Text style={styles.title}>{typeCopy.done}</Text>
        <Text style={styles.subtitle}>{typeCopy.doneBody}</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(150)} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{copy.success.eyebrow}</Text>
            <Text style={styles.taskTitle}>{record.title}</Text>
          </View>
          {record.amount && (
            <View style={styles.amountPill}>
              <Text style={styles.amountText}>{record.amount}</Text>
            </View>
          )}
        </View>

        {detailRows(record).map((row) => (
          <View key={row.label} style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name={row.icon} size={22} color={row.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={onViewHistory} accessibilityRole="button">
          <Ionicons name="open-outline" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>{copy.success.viewReminder}</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, (inCalendar || !record.dueDate) && { opacity: 0.6 }]}
          onPress={addToCalendar}
          disabled={inCalendar || !record.dueDate || addingToCalendar}
          accessibilityRole="button"
        >
          {addingToCalendar ? (
            <ActivityIndicator color={colors.primarySoft} style={{ marginRight: 8 }} />
          ) : (
            <Ionicons
              name={inCalendar ? 'checkmark' : 'calendar-outline'}
              size={20}
              color={colors.primarySoft}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.secondaryButtonText}>
            {inCalendar ? copy.success.addedToCalendar : copy.success.addToCalendar}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={onProcessAnother} accessibilityRole="button">
        <Ionicons name="image-outline" size={22} color={colors.primaryDeep} style={{ marginRight: 10 }} />
        <Text style={styles.primaryButtonText}>{copy.success.processAnother}</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark-outline" size={17} color={colors.secondary} style={{ marginRight: 8 }} />
        <Text style={styles.footerText}>{copy.success.privacy}</Text>
      </View>
    </ScrollView>
  );
};

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
    paddingHorizontal: layout.screenPadding + 4,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  haloOuter: {
    width: 300,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  checkCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.secondaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 7,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 30,
  },
  summaryCard: {
    backgroundColor: colors.neutralSurface,
    borderRadius: 26,
    padding: 22,
    gap: 10,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.secondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  taskTitle: {
    fontFamily: fonts.medium,
    fontSize: 21,
    color: colors.textPrimary,
  },
  amountPill: {
    backgroundColor: colors.tertiaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  amountText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.tertiaryLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralBackground,
    borderRadius: 18,
    padding: 14,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.neutralSurfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.neutralSurfaceActive,
  },
  secondaryButtonText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 22,
  },
  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.primaryDeep,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.textSecondary,
    flexShrink: 1,
  },
});

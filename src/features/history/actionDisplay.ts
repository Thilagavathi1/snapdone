import type { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { actionTypeCopy } from '@/constants/copy';
import { colors } from '@/theme/colors';
import type { ActionCategory, ActionRecord } from '@/types/action';
import { formatDateTime, formatShortDate, formatTime } from '@/utils/dates';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface Badge {
  label: string;
  icon: IconName;
  color: string;
  bg: string;
}

export function statusBadge(record: ActionRecord): Badge {
  if (record.status === 'archived') {
    return { label: 'Archived', icon: 'archive-outline', color: colors.textSecondary, bg: colors.neutralSurfaceActive };
  }
  if (record.status === 'needs_review') {
    return { label: 'Needs review', icon: 'clipboard-outline', color: colors.tertiary, bg: colors.tertiaryMuted };
  }
  if (record.actionType === 'calendar_event') {
    return { label: actionTypeCopy.calendar_event.done, icon: 'calendar-outline', color: colors.primarySoft, bg: colors.primaryMuted };
  }
  return { label: actionTypeCopy[record.actionType].done, icon: 'checkmark-circle-outline', color: colors.secondary, bg: colors.secondaryMuted };
}

export const categoryTile: Record<ActionCategory, { icon: IconName; color: string; bg: string }> = {
  bill: { icon: 'flash-outline', color: colors.primarySoft, bg: colors.primaryMuted },
  appointment: { icon: 'calendar-outline', color: colors.tertiary, bg: colors.tertiaryMuted },
  delivery: { icon: 'cube-outline', color: colors.secondary, bg: colors.secondaryMuted },
  task: { icon: 'checkbox-outline', color: colors.textPrimary, bg: colors.neutralSurfaceActive },
};

/** "Due Oct 28 • ₹2,450" or "Oct 25 • 4:30 PM" */
export function summaryLine(record: ActionRecord): string | undefined {
  const date = formatShortDate(record.dueDate);
  const parts = [
    date && (record.actionType === 'reminder' ? `Due ${date}` : date),
    record.actionType !== 'reminder' && formatTime(record.time),
    record.amount,
  ].filter(Boolean);
  return parts.length ? parts.join(' • ') : undefined;
}

/** The green confirmation line under a card, if there's something to confirm. */
export function confirmationLine(record: ActionRecord): string | undefined {
  if (record.alertAt) return `Alert set for ${formatDateTime(record.alertAt)}`;
  if (record.calendarEventId) return 'Added to your calendar';
  return undefined;
}

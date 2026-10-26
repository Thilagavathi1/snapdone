import type { ExtractedAction } from '@/types/action';
import { findDateInText, to24h } from '@/utils/dates';

const TIME = /\b(\d{1,2}):(\d{2})\s?(am|pm)?\b/i;
const MONTH_LINE = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;

/**
 * Calendar-style date boxes are often read as separate pieces: the row starts
 * with the day ("27 · Talk title") while the month sits on a nearby line
 * ("OCT"). Combine them.
 */
function dateFromSplitBox(row: string, lines: string[], index: number, now: Date): string | undefined {
  const day = row.match(/^(\d{1,2})\b/)?.[1];
  if (!day) return undefined;
  const nearby = [lines[index + 1], lines[index - 1], lines[index + 2], lines[index - 2]];
  const month = nearby.map((l) => l?.trim().match(MONTH_LINE)?.[1]).find(Boolean);
  return month ? findDateInText(`${day} ${month}`, now) : undefined;
}

/**
 * Small models sometimes return a good title but skip the date or time sitting
 * right next to it. Recover them from the OCR row that contains the title.
 * Only fills gaps; never overrides what the model returned.
 */
export function fillFromText(action: ExtractedAction, ocrText: string, now = new Date()): ExtractedAction {
  if (action.dueDate && action.time) return action;

  const needle = action.title.toLowerCase().slice(0, 16);
  const lines = ocrText.split('\n');
  const index = lines.findIndex((line) => line.toLowerCase().includes(needle));
  if (index === -1) return action;
  const row = lines[index];

  const dueDate = action.dueDate ?? findDateInText(row, now) ?? dateFromSplitBox(row, lines, index, now);
  const timeMatch = action.time ? null : row.match(TIME);
  const time = action.time ?? (timeMatch ? to24h(Number(timeMatch[1]), timeMatch[2], timeMatch[3]) : undefined);

  // A dated, timed item is an event even if the model called it a task.
  const actionType = action.actionType === 'task' && dueDate && time ? 'calendar_event' : action.actionType;
  return { ...action, actionType, dueDate, time };
}

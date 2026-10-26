import { Directory, File, Paths } from 'expo-file-system';
import { getServices } from '@/services';
import type { ActionDraft, ActionRecord } from '@/types/action';
import { categorize } from '@/utils/categorize';
import { combineDateTime, formatShortDate } from '@/utils/dates';
import { createId } from '@/utils/id';

/** The draft can't be turned into an action yet. The message is shown to the user. */
export class DraftError extends Error {}

export interface CaptureContext {
  imageUri: string | null;
  ocrText: string;
  confidence: number;
}

function validate(draft: ActionDraft) {
  if (!draft.title.trim()) throw new DraftError('Add a title.');
  if (draft.actionType === 'task') return;
  if (!draft.dueDate) throw new DraftError('Add a date so SnapDone knows when to remind you.');
  const at = combineDateTime(draft.dueDate, draft.time);
  if (!at || at.getTime() < Date.now()) throw new DraftError('That date has already passed. Pick a future date.');
}

/** Keep the screenshot after the picker's cache is cleared. */
async function persistScreenshot(uri: string, id: string): Promise<string> {
  const dir = new Directory(Paths.document, 'screenshots');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const source = new File(uri);
  const destination = new File(dir, `${id}.${source.extension.replace('.', '') || 'jpg'}`);
  await source.copy(destination, { overwrite: true });
  return destination.uri;
}

/** Alerts for a reminder: the day before and on the day, at the given time. */
function reminderTimes(draft: ActionDraft): Date[] {
  const due = combineDateTime(draft.dueDate, draft.time);
  if (!due) return [];
  const dayBefore = new Date(due.getTime() - 86_400_000);
  return draft.actionType === 'reminder' ? [dayBefore, due] : [due];
}

export const actionService = {
  /** Create the reminder, calendar event or task the user confirmed, and save it to history. */
  async create(draft: ActionDraft, context: CaptureContext): Promise<ActionRecord> {
    validate(draft);
    const { notifications, calendar, db } = getServices();
    const id = createId();
    const title = draft.title.trim();
    const body = [formatShortDate(draft.dueDate) && `Due ${formatShortDate(draft.dueDate)}`, draft.amount]
      .filter(Boolean)
      .join(' • ');

    let notificationIds: string[] = [];
    let alertAt: string | undefined;
    let calendarEventId: string | undefined;

    if (draft.actionType === 'calendar_event') {
      calendarEventId = await calendar.addEvent({
        title,
        start: combineDateTime(draft.dueDate, draft.time)!,
        allDay: !draft.time,
        notes: draft.notes || undefined,
      });
    } else if (draft.dueDate) {
      const alerts = await notifications.schedule(title, body || 'From your screenshot', reminderTimes(draft));
      notificationIds = alerts.map((a) => a.id);
      alertAt = alerts[0]?.at.toISOString();
    }

    const record: ActionRecord = {
      id,
      createdAt: new Date().toISOString(),
      imageUri: context.imageUri ? await persistScreenshot(context.imageUri, id) : null,
      ocrText: context.ocrText,
      category: categorize({ actionType: draft.actionType, amount: draft.amount }, context.ocrText),
      actionType: draft.actionType,
      title,
      dueDate: draft.dueDate || undefined,
      time: draft.time || undefined,
      amount: draft.amount.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      confidence: context.confidence,
      status: 'done',
      notificationIds,
      alertAt,
      calendarEventId,
    };
    await db.insert(record);
    return record;
  },

  /** Add an existing reminder or task to the system calendar too. */
  async addToCalendar(record: ActionRecord): Promise<string> {
    if (!record.dueDate) throw new DraftError('This action has no date to put in the calendar.');
    const { calendar, db } = getServices();
    const calendarEventId = await calendar.addEvent({
      title: record.title,
      start: combineDateTime(record.dueDate, record.time)!,
      allDay: !record.time,
      notes: [record.amount, record.notes].filter(Boolean).join(' • ') || undefined,
    });
    await db.update(record.id, { calendarEventId });
    return calendarEventId;
  },

  async remove(record: ActionRecord) {
    const { notifications, db } = getServices();
    await notifications.cancel(record.notificationIds);
    if (record.imageUri) {
      const file = new File(record.imageUri);
      if (file.exists) file.delete();
    }
    await db.remove(record.id);
  },
};

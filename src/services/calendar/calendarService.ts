import { PermissionDeniedError } from '@/services/errors';

export interface CalendarEventInput {
  title: string;
  start: Date;
  allDay: boolean;
  notes?: string;
}

export class CalendarUnavailableError extends Error {}

/**
 * expo-calendar isn't bundled in Expo Go (SDK 58), so it's loaded lazily: the
 * rest of the app keeps working there and only this feature reports an error.
 */
async function loadCalendar() {
  try {
    return await import('expo-calendar');
  } catch {
    throw new CalendarUnavailableError('Calendar needs the development build of SnapDone.');
  }
}

export const calendarService = {
  async addEvent(input: CalendarEventInput): Promise<string> {
    const Calendar = await loadCalendar();

    const { status } = await Calendar.requestCalendarPermissions();
    if (status !== 'granted') throw new PermissionDeniedError('Allow calendar access in Settings to add events.');

    // Android has no single default calendar: prefer the primary writable one.
    const calendars = await Calendar.getCalendars();
    const writable = calendars.filter((c) => c.allowsModifications);
    const target = writable.find((c) => c.isPrimary) ?? writable[0];
    if (!target) throw new CalendarUnavailableError('No writable calendar found on this device.');

    const end = new Date(input.start.getTime() + (input.allDay ? 86_400_000 : 3_600_000));
    const event = await target.createEvent({
      title: input.title,
      startDate: input.start,
      endDate: end,
      allDay: input.allDay,
      notes: input.notes,
      alarms: [{ relativeOffset: input.allDay ? -24 * 60 : -60 }],
    });
    return event.id;
  },
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Date -> "YYYY-MM-DD" in local time. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Date -> "HH:mm" in local time. */
export function toTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "YYYY-MM-DD" (optionally with a time part) -> local Date at midnight, or null. */
export function parseIsoDate(value: string | undefined): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Combine a "YYYY-MM-DD" date and "HH:mm" time into a local Date. */
export function combineDateTime(isoDate: string, time: string | undefined, fallbackTime = '09:00'): Date | null {
  const date = parseIsoDate(isoDate);
  if (!date) return null;
  const [h, m] = (time || fallbackTime).split(':').map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

/** Normalise model output like "2026-10-28T00:00:00Z" to "2026-10-28". */
export function normaliseIsoDate(value: string | undefined): string | undefined {
  const date = parseIsoDate(value);
  return date ? toIsoDate(date) : undefined;
}

/**
 * Find the first date in free text: "Oct 28, 2026", "28 Oct 2026", "28/10/2026" or "2026-10-28".
 * Used by the mock model; the real model does this itself.
 */
export function findDateInText(text: string, now = new Date()): string | undefined {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // Try every "Oct 28" / "28 Oct" candidate; words like "flight 6" look similar but aren't months.
  const candidates = [
    ...[...text.matchAll(/\b([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b,?\s*(\d{4})?/g)].map((m) => ({
      index: m.index,
      month: m[1],
      day: m[2],
      year: m[3],
    })),
    ...[...text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*\.?,?\s*(\d{4})?/g)].map((m) => ({
      index: m.index,
      month: m[2],
      day: m[1],
      year: m[3],
    })),
  ].sort((a, b) => a.index - b.index);
  for (const c of candidates) {
    const month = MONTHS.indexOf(c.month.toLowerCase());
    if (month >= 0 && Number(c.day) >= 1 && Number(c.day) <= 31) {
      const year = c.year ? Number(c.year) : now.getFullYear();
      return toIsoDate(new Date(year, month, Number(c.day)));
    }
  }

  const numeric = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (numeric) return toIsoDate(new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])));

  return undefined;
}

/** "Oct 28" or "Oct 28, 2027" when not this year. */
export function formatShortDate(isoDate: string | undefined, now = new Date()): string | undefined {
  const date = parseIsoDate(isoDate);
  if (!date) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

/** "October 28, 2026" */
export function formatLongDate(isoDate: string | undefined): string | undefined {
  const date = parseIsoDate(isoDate);
  return date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** "09:00" -> "9:00 AM" */
export function formatTime(time: string | undefined): string | undefined {
  if (!time) return undefined;
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "Today, 11:20 AM", "Yesterday", or "Oct 24". */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return `Today, ${formatTime(toTime(date))}`;
  if (days === 1) return 'Yesterday';
  return formatShortDate(toIsoDate(date), now) ?? '';
}

/** "Oct 27 at 9:00 AM" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${formatShortDate(toIsoDate(date))} at ${formatTime(toTime(date))}`;
}

/** Part of the day, used for the "Morning" pill. */
export function partOfDay(time: string | undefined): string | undefined {
  if (!time) return undefined;
  const h = Number(time.split(':')[0]);
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

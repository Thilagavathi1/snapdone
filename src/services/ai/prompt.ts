import { toIsoDate } from '@/utils/dates';

export interface ExtractionPrompt {
  system: string;
  user: string;
  /** The raw OCR text, for models (like the mock) that don't need the prompt. */
  ocrText: string;
}

export function buildExtractionPrompt(ocrText: string, now = new Date()): ExtractionPrompt {
  const system = `You turn text from a phone screenshot into one actionable item.
Today is ${toIsoDate(now)}.
Respond with ONLY a JSON object, no prose, matching:
{
  "actionType": "reminder" | "calendar_event" | "task",
  "title": string,            // short imperative, e.g. "Pay electricity bill"
  "dueDate"?: string,         // ISO 8601 date, YYYY-MM-DD
  "time"?: string,            // 24h HH:mm
  "amount"?: string,          // with currency symbol, e.g. "₹2,450"
  "notes"?: string,           // reference numbers, locations, gate, etc.
  "confidence": number        // 0 to 1
}
The text is the screenshot read row by row; " · " separates things side by side in the same row.
Rules:
- Bills and payments -> "reminder". Flights, bookings, appointments, events, streams, meetings -> "calendar_event". Anything else -> "task".
- If there are several items (a schedule or list), pick the first upcoming one and use the date and time from its row.
- Dates like "MON · 26 OCT" or "26 Oct" mean that day; write them as YYYY-MM-DD.
- Omit fields you cannot find. Never invent dates or amounts.
- If the year is missing, assume the next occurrence after today.

Example
Text: "TUE 27 OCT · Open Source Ready Live · STREAM 11:30 PM - 12:30 AM"
Answer: {"actionType":"calendar_event","title":"Open Source Ready Live","dueDate":"${now.getFullYear()}-10-27","time":"23:30","notes":"Stream","confidence":0.9}`;

  return { system, user: `Screenshot text:\n"""\n${ocrText}\n"""`, ocrText };
}

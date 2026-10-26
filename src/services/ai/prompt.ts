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
Rules:
- Bills and payments -> "reminder". Flights, bookings, appointments -> "calendar_event". Anything else -> "task".
- Omit fields you cannot find. Never invent dates or amounts.
- If the year is missing, assume the next occurrence after today.`;

  return { system, user: `Screenshot text:\n"""\n${ocrText}\n"""`, ocrText };
}

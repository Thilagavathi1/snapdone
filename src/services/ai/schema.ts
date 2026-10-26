import { z } from 'zod';
import type { ExtractedAction } from '@/types/action';
import { normaliseIsoDate } from '@/utils/dates';

// Small models often emit null for missing fields; treat that as "not set".
const optionalString = z
  .string()
  .nullish()
  .transform((v) => (v?.trim() ? v.trim() : undefined));

export const extractedActionSchema = z.object({
  actionType: z.enum(['reminder', 'calendar_event', 'task']),
  title: z.string().trim().min(1),
  dueDate: optionalString.refine((v) => v === undefined || normaliseIsoDate(v) !== undefined, {
    message: 'dueDate must be ISO 8601',
  }),
  time: optionalString.refine((v) => v === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), {
    message: 'time must be HH:mm',
  }),
  amount: optionalString,
  notes: optionalString,
  confidence: z.number().min(0).max(1),
});

/**
 * JSON Schema handed to the model runtime, which turns it into a grammar so
 * generation can only produce this shape. Zod still validates the result.
 * Keep it simple: llama.rn's grammar converter rejects regex `pattern`s.
 */
export const extractedActionJsonSchema = {
  type: 'object',
  properties: {
    actionType: { type: 'string', enum: ['reminder', 'calendar_event', 'task'] },
    title: { type: 'string' },
    dueDate: { type: 'string', description: 'YYYY-MM-DD' },
    time: { type: 'string', description: 'HH:mm, 24-hour' },
    amount: { type: 'string' },
    notes: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['actionType', 'title', 'confidence'],
} as const;

export type ParseResult = { ok: true; action: ExtractedAction } | { ok: false; reason: string };

/** Parse raw model text into a validated ExtractedAction. Never throws. */
export function parseModelOutput(raw: string): ParseResult {
  // Models sometimes wrap JSON in prose or ```json fences; take the outermost object.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return { ok: false, reason: 'No JSON object in model output' };

  let json: unknown;
  try {
    json = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { ok: false, reason: 'Model output is not valid JSON' };
  }

  const result = extractedActionSchema.safeParse(json);
  if (!result.success) {
    return { ok: false, reason: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  const action = result.data;
  return { ok: true, action: { ...action, dueDate: normaliseIsoDate(action.dueDate) } };
}

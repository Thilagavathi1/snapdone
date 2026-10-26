import type { ExtractedAction } from '@/types/action';
import { findDateInText, to24h } from '@/utils/dates';
import type { LocalModel } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Stands in for Gemma during UI development. Uses simple pattern matching, then
 * returns a JSON string so the real parsing and Zod validation path still runs.
 */
export const mockGemmaModel: LocalModel = {
  name: 'Gemma 2B (mock)',
  async generate({ ocrText }) {
    await wait(1400);
    const text = ocrText;
    const lower = text.toLowerCase();

    const amountMatch = text.match(/(₹|Rs\.?|INR|\$|€|£)\s?([\d,]+(?:\.\d{2})?)/);
    const currency = amountMatch && /^(Rs|INR)/.test(amountMatch[1]) ? '₹' : amountMatch?.[1];
    const amount = amountMatch ? `${currency}${amountMatch[2].replace(/\.00$/, '')}` : undefined;
    const dueDate = findDateInText(text.match(/due[^\n]*/i)?.[0] ?? text);
    const timeMatch = text.match(/\b(\d{1,2}):(\d{2})\s?(am|pm)?\b/i);
    const time = timeMatch ? to24h(Number(timeMatch[1]), timeMatch[2], timeMatch[3]) : undefined;
    const reference = text.match(/(consumer|account|booking|pnr|tracking)\s*(no|id|#)?[:.\s]*([A-Z0-9-]{5,})/i);

    let action: ExtractedAction;
    if (/\b(bill|payable|amount due)\b/.test(lower)) {
      const kind = /electric/.test(lower) ? 'electricity' : /water/.test(lower) ? 'water' : /internet|broadband/.test(lower) ? 'internet' : undefined;
      action = {
        actionType: 'reminder',
        title: kind ? `Pay ${kind} bill` : 'Pay bill',
        dueDate,
        time: '09:00',
        amount,
        notes: reference ? `${reference[1]} No: ${reference[3]} • Due within 3 days to avoid late fees` : undefined,
        confidence: 0.87,
      };
    } else if (/\b(flight|boarding|appointment|booking|reservation|check-in)\b/.test(lower)) {
      action = {
        actionType: 'calendar_event',
        title: text.split('\n')[0].trim().slice(0, 60),
        dueDate,
        time,
        notes: reference ? `${reference[1]}: ${reference[3]}` : undefined,
        confidence: 0.82,
      };
    } else {
      // Mimic a model that can't find anything useful: not JSON, so the app shows "Needs review".
      if (text.trim().length < 12) return 'I could not find an actionable item in this screenshot.';
      action = { actionType: 'task', title: text.split('\n')[0].trim().slice(0, 60), dueDate, amount, confidence: 0.55 };
    }

    return JSON.stringify(action);
  },
};

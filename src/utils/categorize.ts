import type { ActionCategory, ExtractedAction } from '@/types/action';

/**
 * The model only returns an action type, so derive the display category from
 * the extracted fields and the screenshot text.
 */
export function categorize(action: Pick<ExtractedAction, 'actionType' | 'amount'>, ocrText: string): ActionCategory {
  const text = ocrText.toLowerCase();
  if (/\b(deliver|courier|shipment|shipped|out for delivery|tracking|parcel|package)/.test(text)) return 'delivery';
  if (action.amount || /\b(bill|invoice|payable|amount due|due date)\b/.test(text)) return 'bill';
  if (action.actionType === 'calendar_event') return 'appointment';
  return 'task';
}

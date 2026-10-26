export type ActionType = 'reminder' | 'calendar_event' | 'task';

/** What the AI service must return. Validated with Zod in services/ai/schema.ts. */
export type ExtractedAction = {
  actionType: ActionType;
  title: string;
  dueDate?: string; // ISO 8601
  time?: string; // HH:mm
  amount?: string;
  notes?: string;
  confidence: number; // 0 to 1
};

export type ActionCategory = 'bill' | 'appointment' | 'delivery' | 'task';

export type ActionStatus = 'done' | 'needs_review' | 'archived';

/** A confirmed action as stored in SQLite. */
export interface ActionRecord {
  id: string;
  createdAt: string; // ISO 8601
  imageUri: string | null;
  ocrText: string;
  category: ActionCategory;
  actionType: ActionType;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount?: string;
  notes?: string;
  confidence: number;
  status: ActionStatus;
  notificationIds: string[];
  /** When the first scheduled alert fires, if any. */
  alertAt?: string;
  calendarEventId?: string;
}

/** The editable form on the review screen. Empty strings mean "not set". */
export interface ActionDraft {
  actionType: ActionType;
  title: string;
  dueDate: string;
  time: string;
  amount: string;
  notes: string;
}

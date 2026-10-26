import * as SQLite from 'expo-sqlite';
import type { ActionRecord } from '@/types/action';

export interface ActionRepository {
  list(): Promise<ActionRecord[]>;
  insert(record: ActionRecord): Promise<void>;
  update(id: string, patch: Partial<ActionRecord>): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

interface ActionRow {
  id: string;
  created_at: string;
  image_uri: string | null;
  ocr_text: string;
  category: string;
  action_type: string;
  title: string;
  due_date: string | null;
  time: string | null;
  amount: string | null;
  notes: string | null;
  confidence: number;
  status: string;
  notification_ids: string;
  alert_at: string | null;
  calendar_event_id: string | null;
}

const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('snapdone.db');
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS actions (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          image_uri TEXT,
          ocr_text TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL,
          action_type TEXT NOT NULL,
          title TEXT NOT NULL,
          due_date TEXT,
          time TEXT,
          amount TEXT,
          notes TEXT,
          confidence REAL NOT NULL,
          status TEXT NOT NULL,
          notification_ids TEXT NOT NULL DEFAULT '[]',
          alert_at TEXT,
          calendar_event_id TEXT
        );
        PRAGMA user_version = ${SCHEMA_VERSION};
      `);
    }
    return db;
  })();
  return dbPromise;
}

const columns: Record<keyof ActionRecord, keyof ActionRow> = {
  id: 'id',
  createdAt: 'created_at',
  imageUri: 'image_uri',
  ocrText: 'ocr_text',
  category: 'category',
  actionType: 'action_type',
  title: 'title',
  dueDate: 'due_date',
  time: 'time',
  amount: 'amount',
  notes: 'notes',
  confidence: 'confidence',
  status: 'status',
  notificationIds: 'notification_ids',
  alertAt: 'alert_at',
  calendarEventId: 'calendar_event_id',
};

function toRow(record: Partial<ActionRecord>): Partial<Record<keyof ActionRow, SQLite.SQLiteBindValue>> {
  const row: Partial<Record<keyof ActionRow, SQLite.SQLiteBindValue>> = {};
  for (const [key, value] of Object.entries(record) as [keyof ActionRecord, unknown][]) {
    row[columns[key]] = key === 'notificationIds' ? JSON.stringify(value) : ((value ?? null) as SQLite.SQLiteBindValue);
  }
  return row;
}

function fromRow(row: ActionRow): ActionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    imageUri: row.image_uri,
    ocrText: row.ocr_text,
    category: row.category as ActionRecord['category'],
    actionType: row.action_type as ActionRecord['actionType'],
    title: row.title,
    dueDate: row.due_date ?? undefined,
    time: row.time ?? undefined,
    amount: row.amount ?? undefined,
    notes: row.notes ?? undefined,
    confidence: row.confidence,
    status: row.status as ActionRecord['status'],
    notificationIds: JSON.parse(row.notification_ids) as string[],
    alertAt: row.alert_at ?? undefined,
    calendarEventId: row.calendar_event_id ?? undefined,
  };
}

export const sqliteActionRepository: ActionRepository = {
  async list() {
    const db = await getDb();
    const rows = await db.getAllAsync<ActionRow>('SELECT * FROM actions ORDER BY created_at DESC');
    return rows.map(fromRow);
  },
  async insert(record) {
    const db = await getDb();
    const row = toRow(record);
    const keys = Object.keys(row);
    await db.runAsync(
      `INSERT INTO actions (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      Object.values(row) as SQLite.SQLiteBindValue[],
    );
  },
  async update(id, patch) {
    const db = await getDb();
    const row = toRow(patch);
    const keys = Object.keys(row);
    if (keys.length === 0) return;
    await db.runAsync(`UPDATE actions SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [
      ...(Object.values(row) as SQLite.SQLiteBindValue[]),
      id,
    ]);
  },
  async remove(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM actions WHERE id = ?', id);
  },
  async clear() {
    const db = await getDb();
    await db.runAsync('DELETE FROM actions');
  },
};

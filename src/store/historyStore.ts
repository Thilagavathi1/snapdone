import { create } from 'zustand';
import { actionService } from '@/features/actions/actionService';
import { getServices } from '@/services';
import type { ActionRecord } from '@/types/action';

interface HistoryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  items: ActionRecord[];
  load(): Promise<void>;
  add(record: ActionRecord): void;
  update(id: string, patch: Partial<ActionRecord>): Promise<void>;
  remove(record: ActionRecord): Promise<void>;
  clear(): Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  status: 'idle',
  items: [],

  async load() {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      set({ items: await getServices().db.list(), status: 'ready' });
    } catch (e) {
      console.warn('Failed to load history', e);
      set({ status: 'error' });
    }
  },

  add(record) {
    set((s) => ({ items: [record, ...s.items] }));
  },

  async update(id, patch) {
    await getServices().db.update(id, patch);
    set((s) => ({ items: s.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  },

  async remove(record) {
    await actionService.remove(record);
    set((s) => ({ items: s.items.filter((item) => item.id !== record.id) }));
  },

  async clear() {
    await Promise.all(get().items.map((item) => actionService.remove(item)));
    await getServices().db.clear();
    set({ items: [] });
  },
}));

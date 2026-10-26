import { create } from 'zustand';
import { actionService } from '@/features/actions/actionService';
import { getServices } from '@/services';
import type { ActionDraft, ActionRecord, ExtractedAction } from '@/types/action';
import { useHistoryStore } from './historyStore';

export type CapturePhase =
  | 'idle'
  | 'reading' // OCR running
  | 'extracting' // Gemma running
  | 'ready' // valid extraction, waiting for the user to confirm
  | 'needs_review' // model output missing or invalid: manual entry
  | 'ocr_failed';

interface CaptureState {
  phase: CapturePhase;
  imageUri: string | null;
  fileName: string | null;
  ocrText: string;
  confidence: number;
  durationMs: number;
  failureReason: string | null;
  draft: ActionDraft;
  /** Fields are read-only until the user taps "Edit manually"; manual entry starts editable. */
  editing: boolean;
  saving: boolean;
  /** The action created by the last confirm, shown on the success screen. */
  lastRecord: ActionRecord | null;

  start(image: { uri: string; fileName?: string | null }): Promise<void>;
  enterManually(): void;
  updateDraft(patch: Partial<ActionDraft>): void;
  setEditing(editing: boolean): void;
  confirm(): Promise<ActionRecord>;
  setLastRecord(record: ActionRecord): void;
  reset(): void;
}

const emptyDraft: ActionDraft = { actionType: 'reminder', title: '', dueDate: '', time: '', amount: '', notes: '' };

const toDraft = (a: ExtractedAction): ActionDraft => ({
  actionType: a.actionType,
  title: a.title,
  dueDate: a.dueDate ?? '',
  time: a.time ?? '',
  amount: a.amount ?? '',
  notes: a.notes ?? '',
});

const initial = {
  phase: 'idle' as CapturePhase,
  imageUri: null,
  fileName: null,
  ocrText: '',
  confidence: 0,
  durationMs: 0,
  failureReason: null,
  draft: emptyDraft,
  editing: false,
  saving: false,
  lastRecord: null,
};

// Each start() gets a run id so a slow earlier run can't overwrite a newer one.
let currentRun = 0;

export const useCaptureStore = create<CaptureState>((set, get) => ({
  ...initial,

  async start({ uri, fileName }) {
    const run = ++currentRun;
    const { ocr, ai } = getServices();
    set({ ...initial, phase: 'reading', imageUri: uri, fileName: fileName ?? null });

    let ocrText: string;
    try {
      ocrText = (await ocr.recognize(uri)).text;
    } catch (e) {
      if (run !== currentRun) return;
      set({ phase: 'ocr_failed', failureReason: e instanceof Error ? e.message : String(e) });
      return;
    }
    if (run !== currentRun) return;
    set({ phase: 'extracting', ocrText });

    const result = await ai.extract(ocrText);
    if (run !== currentRun) return;
    if (__DEV__) {
      // Chunked: the debugger truncates long messages.
      for (let i = 0; i < ocrText.length; i += 400) console.log(`[ocr ${i}]`, ocrText.slice(i, i + 400));
      console.log('[ai]', JSON.stringify(result));
    }
    if (result.ok) {
      set({ phase: 'ready', draft: toDraft(result.action), confidence: result.action.confidence, durationMs: result.durationMs });
    } else {
      console.warn('Extraction needs review:', result.reason);
      set({ phase: 'needs_review', editing: true, failureReason: result.reason, durationMs: result.durationMs });
    }
  },

  enterManually() {
    set({ phase: 'needs_review', editing: true, draft: emptyDraft });
  },

  updateDraft(patch) {
    set((s) => ({ draft: { ...s.draft, ...patch } }));
  },

  setEditing(editing) {
    set({ editing });
  },

  async confirm() {
    const { draft, imageUri, ocrText, confidence, phase } = get();
    set({ saving: true });
    try {
      const record = await actionService.create(draft, {
        imageUri,
        ocrText,
        // Manually entered details aren't AI output; record them as fully confirmed.
        confidence: phase === 'needs_review' ? 1 : confidence,
      });
      useHistoryStore.getState().add(record);
      set({ lastRecord: record });
      return record;
    } finally {
      set({ saving: false });
    }
  },

  setLastRecord(record) {
    set({ lastRecord: record });
  },

  reset() {
    currentRun++;
    set(initial);
  },
}));

import { File } from 'expo-file-system';
import { create } from 'zustand';
import { releaseGemma } from '@/services/ai/llamaGemmaModel';
import { GEMMA_MODEL, isModelDownloaded, modelFile } from '@/services/ai/gemmaModelFile';

type DownloadTask = ReturnType<typeof File.createDownloadTask>;

interface ModelState {
  status: 'missing' | 'downloading' | 'ready' | 'error';
  /** 0 to 1 while downloading. */
  progress: number;
  error: string | null;
  refresh(): void;
  download(): Promise<void>;
  cancel(): void;
  remove(): Promise<void>;
}

let task: DownloadTask | null = null;

export const useModelStore = create<ModelState>((set, get) => ({
  status: isModelDownloaded() ? 'ready' : 'missing',
  progress: 0,
  error: null,

  refresh() {
    if (get().status !== 'downloading') set({ status: isModelDownloaded() ? 'ready' : 'missing' });
  },

  async download() {
    if (get().status === 'downloading' || isModelDownloaded()) return;
    const file = modelFile();
    if (file.exists) file.delete(); // leftover partial download

    set({ status: 'downloading', progress: 0, error: null });
    task = File.createDownloadTask(GEMMA_MODEL.url, file, {
      onProgress: ({ bytesWritten, totalBytes }) => {
        const total = totalBytes > 0 ? totalBytes : GEMMA_MODEL.sizeBytes;
        set({ progress: Math.min(bytesWritten / total, 1) });
      },
    });

    try {
      const result = await task.downloadAsync();
      if (!result) return; // paused
      if (!isModelDownloaded()) throw new Error('The download was incomplete. Try again on Wi-Fi.');
      set({ status: 'ready', progress: 1 });
    } catch (e) {
      if (file.exists) file.delete();
      // cancel() already reset the state.
      if (get().status === 'downloading') {
        set({ status: 'error', error: e instanceof Error ? e.message : 'Download failed.' });
      }
    } finally {
      task = null;
    }
  },

  cancel() {
    task?.cancel();
    set({ status: 'missing', progress: 0 });
  },

  async remove() {
    await releaseGemma();
    const file = modelFile();
    if (file.exists) file.delete();
    set({ status: 'missing', progress: 0 });
  },
}));

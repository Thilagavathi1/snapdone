import { Directory, File, Paths } from 'expo-file-system';

/** The open-weight model SnapDone runs locally. Downloaded once, then used offline. */
export const GEMMA_MODEL = {
  name: 'Gemma 3 1B',
  quantization: 'Q4_K_M',
  url: 'https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf',
  fileName: 'gemma-3-1b-it-Q4_K_M.gguf',
  sizeBytes: 806_058_240,
};

export function modelDirectory(): Directory {
  const dir = new Directory(Paths.document, 'models');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function modelFile(): File {
  return new File(modelDirectory(), GEMMA_MODEL.fileName);
}

/** A complete download has exactly the expected size; anything else is a partial file. */
export function isModelDownloaded(): boolean {
  const file = modelFile();
  return file.exists && file.size === GEMMA_MODEL.sizeBytes;
}

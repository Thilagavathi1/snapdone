import type { ExtractedAction } from '@/types/action';
import type { ExtractionPrompt } from './prompt';

/** A local text-generation model. Implementations must run inference natively, never on the JS thread. */
export interface LocalModel {
  readonly name: string;
  generate(prompt: ExtractionPrompt): Promise<string>;
}

export type AiExtractionResult =
  | { ok: true; action: ExtractedAction; durationMs: number }
  | { ok: false; reason: string; durationMs: number; raw?: string };

export interface AiService {
  readonly modelName: string;
  extract(ocrText: string): Promise<AiExtractionResult>;
}

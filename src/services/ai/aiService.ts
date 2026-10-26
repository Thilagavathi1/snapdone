import { fillFromText } from './fillFromText';
import { buildExtractionPrompt } from './prompt';
import { parseModelOutput } from './schema';
import type { AiService, LocalModel } from './types';

/** Wraps any LocalModel with prompting and strict output validation. */
export function createAiService(model: LocalModel): AiService {
  return {
    modelName: model.name,
    async extract(ocrText) {
      const started = Date.now();
      if (!ocrText.trim()) {
        return { ok: false, reason: 'No text found in screenshot', durationMs: 0 };
      }

      let raw: string;
      try {
        raw = await model.generate(buildExtractionPrompt(ocrText));
      } catch (e) {
        return { ok: false, reason: e instanceof Error ? e.message : 'Model failed', durationMs: Date.now() - started };
      }

      const parsed = parseModelOutput(raw);
      const durationMs = Date.now() - started;
      return parsed.ok
        ? { ok: true, action: fillFromText(parsed.action, ocrText), durationMs }
        : { ok: false, reason: parsed.reason, durationMs, raw };
    },
  };
}

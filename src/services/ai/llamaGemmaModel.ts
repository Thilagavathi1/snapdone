import { Platform } from 'react-native';
import type { LlamaContext } from 'llama.rn';
import { GEMMA_MODEL, isModelDownloaded, modelFile } from './gemmaModelFile';
import { extractedActionJsonSchema } from './schema';
import type { LocalModel } from './types';

// Screenshot text beyond this is cut so prompt + answer fit in the context window.
const MAX_OCR_CHARS = 3000;

export class ModelNotReadyError extends Error {}

let contextPromise: Promise<LlamaContext> | null = null;

/** Load Gemma once and reuse it; loading takes a few seconds. */
async function getContext(): Promise<LlamaContext> {
  if (!isModelDownloaded()) {
    throw new ModelNotReadyError(`Download ${GEMMA_MODEL.name} from the Home screen first (one time, ${Math.round(GEMMA_MODEL.sizeBytes / 1e6)} MB).`);
  }
  contextPromise ??= (async () => {
    let initLlama: typeof import('llama.rn').initLlama;
    try {
      ({ initLlama } = await import('llama.rn'));
    } catch {
      throw new ModelNotReadyError('Local Gemma needs the development build. Turn on demo mode in Settings to try the flow.');
    }
    return initLlama({
      model: modelFile().uri,
      n_ctx: 2048,
      // Metal on iOS; on Android stay on CPU, since GPU (OpenCL) support varies by chipset.
      n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
      use_mlock: false,
    });
  })().catch((e) => {
    contextPromise = null;
    throw e;
  });
  return contextPromise;
}

/** Free the model's memory, e.g. before deleting the file. */
export async function releaseGemma() {
  const pending = contextPromise;
  contextPromise = null;
  if (pending) await (await pending.catch(() => null))?.release();
}

/**
 * Gemma running locally through llama.cpp (llama.rn). Inference runs on native
 * threads, so the JS thread stays free while the model generates.
 */
export const llamaGemmaModel: LocalModel = {
  name: `${GEMMA_MODEL.name} (on device)`,
  async generate({ system, user }) {
    const context = await getContext();
    const result = await context.completion({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user.slice(0, MAX_OCR_CHARS) },
      ],
      jinja: true,
      response_format: { type: 'json_schema', json_schema: { strict: true, schema: extractedActionJsonSchema } },
      n_predict: 320,
      temperature: 0,
      stop: ['<end_of_turn>', '<eos>'],
    });
    return result.content || result.text;
  },
};

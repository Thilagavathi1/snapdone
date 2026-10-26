import type { OcrService } from './types';
import { OcrError } from './types';

/**
 * On-device OCR with Google ML Kit text recognition. Recognition runs in
 * native code, off the JS thread. The module is loaded lazily so a missing
 * native module (e.g. in Expo Go) surfaces as a readable error, not a crash.
 */
export const mlKitOcrService: OcrService = {
  name: 'ML Kit (on device)',
  isMock: false,
  async recognize(imageUri) {
    const started = Date.now();
    let recognizeText: typeof import('@infinitered/react-native-mlkit-text-recognition').recognizeText;
    try {
      ({ recognizeText } = await import('@infinitered/react-native-mlkit-text-recognition'));
    } catch {
      throw new OcrError('On-device OCR needs the development build. Turn on demo mode in Settings to try the flow.');
    }

    try {
      const result = await recognizeText(imageUri);
      return { text: result.text, durationMs: Date.now() - started };
    } catch (e) {
      throw new OcrError(e instanceof Error ? e.message : 'Text recognition failed.');
    }
  },
};

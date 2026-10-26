export interface OcrResult {
  text: string;
  durationMs: number;
}

export interface OcrService {
  readonly name: string;
  /** True when this returns canned text instead of reading the image. */
  readonly isMock: boolean;
  /** Extract all text from a local image URI. Runs natively, off the JS thread. */
  recognize(imageUri: string): Promise<OcrResult>;
}

export class OcrError extends Error {}

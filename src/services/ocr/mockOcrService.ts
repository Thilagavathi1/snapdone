import type { OcrService } from './types';

// The default demo screenshot: an electricity bill.
export const SAMPLE_BILL_TEXT = `STATE ELECTRICITY BOARD
West Zone Distribution
Consumer No: 884920182
Bill Date: Oct 14, 2026
Units consumed: 312
Net Payable: ₹2,450.00
Due Date: Oct 28, 2026
Pay before the due date to avoid late fees.`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Returns fixed text so the UI can be built and demoed without native OCR. */
export const mockOcrService: OcrService = {
  name: 'Mock OCR',
  isMock: true,
  async recognize() {
    const started = Date.now();
    await wait(900);
    return { text: SAMPLE_BILL_TEXT, durationMs: Date.now() - started };
  },
};

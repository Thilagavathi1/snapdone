import Storage from 'expo-sqlite/kv-store';
import { createAiService } from './ai/aiService';
import { llamaGemmaModel } from './ai/llamaGemmaModel';
import { mockGemmaModel } from './ai/mockGemmaModel';
import type { AiService } from './ai/types';
import { calendarService } from './calendar/calendarService';
import { sqliteActionRepository, type ActionRepository } from './database/actionRepository';
import { notificationService } from './notifications/notificationService';
import { mlKitOcrService } from './ocr/mlKitOcrService';
import { mockOcrService } from './ocr/mockOcrService';
import type { OcrService } from './ocr/types';

export interface Services {
  ocr: OcrService;
  ai: AiService;
  db: ActionRepository;
  notifications: typeof notificationService;
  calendar: typeof calendarService;
}

const DEMO_MODE_KEY = 'settings.demoMode';

/** Demo mode swaps in the mock OCR and model, e.g. for Expo Go or a quick walkthrough. */
function pipeline(demo: boolean): Pick<Services, 'ocr' | 'ai'> {
  return demo
    ? { ocr: mockOcrService, ai: createAiService(mockGemmaModel) }
    : { ocr: mlKitOcrService, ai: createAiService(llamaGemmaModel) };
}

let demoMode = Storage.getItemSync(DEMO_MODE_KEY) === 'true';

let services: Services = {
  ...pipeline(demoMode),
  db: sqliteActionRepository,
  notifications: notificationService,
  calendar: calendarService,
};

export const getServices = () => services;

/** Replace implementations, e.g. with fakes in tests. */
export function setServices(overrides: Partial<Services>) {
  services = { ...services, ...overrides };
}

export const isDemoMode = () => demoMode;

export function setDemoMode(on: boolean) {
  demoMode = on;
  Storage.setItemSync(DEMO_MODE_KEY, String(on));
  services = { ...services, ...pipeline(on) };
}

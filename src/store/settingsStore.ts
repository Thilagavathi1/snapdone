import { create } from 'zustand';
import { isDemoMode, setDemoMode } from '@/services';

interface SettingsState {
  demoMode: boolean;
  setDemoMode(on: boolean): void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  demoMode: isDemoMode(),
  setDemoMode(on) {
    setDemoMode(on);
    set({ demoMode: on });
  },
}));

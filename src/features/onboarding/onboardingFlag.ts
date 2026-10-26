import Storage from 'expo-sqlite/kv-store';

const KEY = 'onboarding.completed';

export const onboardingFlag = {
  isCompleted: () => Storage.getItemSync(KEY) === 'true',
  complete: () => Storage.setItemSync(KEY, 'true'),
  reset: () => Storage.removeItemSync(KEY),
};

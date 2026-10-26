import { Redirect, router } from 'expo-router';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { onboardingFlag } from '@/features/onboarding/onboardingFlag';

export default function OnboardingRoute() {
  if (onboardingFlag.isCompleted()) return <Redirect href="/home" />;

  return (
    <OnboardingScreen
      onGetStarted={() => {
        onboardingFlag.complete();
        router.replace('/home');
      }}
    />
  );
}

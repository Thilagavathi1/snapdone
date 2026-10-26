import { router } from 'expo-router';
import { ReviewScreen } from '@/features/review/ReviewScreen';
import { useCaptureStore } from '@/store/captureStore';

export default function ReviewRoute() {
  return (
    <ReviewScreen
      onBack={() => {
        useCaptureStore.getState().reset();
        if (router.canGoBack()) router.back();
        else router.replace('/home');
      }}
      onCreated={() => router.replace('/success')}
    />
  );
}

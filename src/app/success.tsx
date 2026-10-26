import { router } from 'expo-router';
import { SuccessScreen } from '@/features/actions/SuccessScreen';
import { useCaptureStore } from '@/store/captureStore';

const finish = (href: '/home' | '/history') => {
  useCaptureStore.getState().reset();
  router.dismissTo(href);
};

export default function SuccessRoute() {
  return <SuccessScreen onViewHistory={() => finish('/history')} onProcessAnother={() => finish('/home')} />;
}

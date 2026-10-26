import { router } from 'expo-router';
import { HomeScreen } from '@/features/capture/HomeScreen';

export default function HomeRoute() {
  return <HomeScreen onViewAll={() => router.navigate('/history')} onOpenSettings={() => router.navigate('/settings')} />;
}

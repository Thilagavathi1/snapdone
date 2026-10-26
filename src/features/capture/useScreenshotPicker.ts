import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCaptureStore } from '@/store/captureStore';

/**
 * Pick or shoot a screenshot, start processing it, and open the review screen.
 * Pass `openReview: false` when already on the review screen.
 */
export function useScreenshotPicker({ openReview = true } = {}) {
  const start = useCaptureStore((s) => s.start);

  const begin = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) return;
      const asset = result.assets[0];
      void start({ uri: asset.uri, fileName: asset.fileName });
      if (openReview) router.push('/review');
    },
    [start, openReview],
  );

  const pickFromLibrary = useCallback(async () => {
    try {
      begin(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 }));
    } catch (e) {
      Alert.alert("Couldn't open Photos", e instanceof Error ? e.message : undefined);
    }
  }, [begin]);

  const takePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Allow camera access in Settings to scan bills and tickets.');
        return;
      }
      begin(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }));
    } catch (e) {
      Alert.alert("Couldn't open the camera", e instanceof Error ? e.message : undefined);
    }
  }, [begin]);

  return { pickFromLibrary, takePhoto };
}

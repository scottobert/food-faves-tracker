import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';

interface UseCapacitorCameraResult {
  takePhoto: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  isNativeApp: boolean;
}

export const useCapacitorCamera = (): UseCapacitorCameraResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNativeApp, setIsNativeApp] = useState(false);

  // Check if running in native app
  const checkPlatform = async () => {
    try {
      const info = await Device.getInfo();
      setIsNativeApp(info.platform !== 'web');
    } catch {
      setIsNativeApp(false);
    }
  };

  // Initialize platform check
  useState(() => {
    checkPlatform();
  });

  const takePhoto = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isNativeApp) {
        // Fallback for web - use regular file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          
          input.oncancel = () => resolve(null);
          input.click();
        });
      }

      // Native camera functionality
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    takePhoto,
    isLoading,
    error,
    isNativeApp,
  };
};

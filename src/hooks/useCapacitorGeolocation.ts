import { useState, useEffect } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseCapacitorGeolocationResult {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationCoords | null>;
  isNativeApp: boolean;
}

export const useCapacitorGeolocation = (): UseCapacitorGeolocationResult => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNativeApp, setIsNativeApp] = useState(false);

  // Check if running in native app
  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const info = await Device.getInfo();
        setIsNativeApp(info.platform !== 'web');
      } catch {
        setIsNativeApp(false);
      }
    };
    checkPlatform();
  }, []);

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let position: Position;

      if (isNativeApp) {
        // Use Capacitor geolocation for native apps
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
      } else {
        // Fallback to web geolocation API
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: LocationCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              };
              resolve(coords);
            },
            (err) => reject(new Error(err.message)),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        });
      }

      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    isNativeApp,
  };
};

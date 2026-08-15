import { create } from 'zustand';

const CACHE_KEY = 'interappshop_user_location';
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

interface GeolocationState {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;

  requestLocation: () => Promise<void>;
  calculateDistance: (lat: number, lng: number) => number | null;
}

const readCache = (): { latitude: number; longitude: number; ts: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.latitude !== 'number' || typeof parsed?.longitude !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (latitude: number, longitude: number) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ latitude, longitude, ts: Date.now() }));
  } catch {
    // localStorage indisponible, on ignore
  }
};

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  userLocation: null,
  permissionGranted: false,
  loading: false,
  error: null,

  requestLocation: async () => {
    // 1) Position en cache encore valide => retour immédiat (rapide)
    const cached = readCache();
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      set({
        userLocation: { latitude: cached.latitude, longitude: cached.longitude },
        permissionGranted: true,
        loading: false,
        error: null,
      });
      return;
    }

    if (!navigator.geolocation) {
      // 2) Pas de géolocalisation => utiliser le cache même s'il est expiré
      if (cached) {
        set({
          userLocation: { latitude: cached.latitude, longitude: cached.longitude },
          permissionGranted: true,
          loading: false,
          error: null,
        });
        return;
      }
      set({
        error: 'Géolocalisation non supportée par votre navigateur',
        loading: false,
      });
      return;
    }

    set({ loading: true, error: null });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        // Options pour accélérer la récupération :
        // - timeout limite l'attente (ne bloque plus indéfiniment)
        // - maximumAge autorise une position récente déjà connue du navigateur
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      writeCache(location.latitude, location.longitude);

      set({
        userLocation: location,
        permissionGranted: true,
        loading: false,
      });
    } catch (error) {
      // 3) Erreur (permission refusée, timeout...) => cache même expiré en secours
      if (cached) {
        set({
          userLocation: { latitude: cached.latitude, longitude: cached.longitude },
          permissionGranted: true,
          loading: false,
        });
        return;
      }
      set({
        error: 'Permission de géolocalisation refusée',
        loading: false,
      });
    }
  },

  calculateDistance: (lat: number, lng: number) => {
    const { userLocation } = get();
    if (!userLocation) return null;

    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (lng - userLocation.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.latitude * Math.PI / 180) *
        Math.cos(lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
}));

'use client';

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useGeolocationStore } from '@/store/geolocationStore';

interface GeolocationCaptureProps {
  warningMessage?: string;
  onLocationCaptured?: (lat: number, lng: number, address: string) => void;
}

export function GeolocationCapture({ 
  warningMessage = "Votre position actuelle sera utilisée comme localisation",
  onLocationCaptured 
}: GeolocationCaptureProps) {
  const { userLocation, loading, error, requestLocation } = useGeolocationStore();
  const [captured, setCaptured] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  // Reverse geocoding pour obtenir l'adresse à partir des coordonnées
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AlibabaClone/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setLoadingAddress(false);
    }
  };
  
  const handleCapture = async () => {
    await requestLocation();
    setCaptured(true);
  };
  
  // Quand la position est capturée, obtenir l'adresse
  useEffect(() => {
    if (userLocation && captured) {
      getAddressFromCoordinates(userLocation.latitude, userLocation.longitude).then((addr) => {
        if (onLocationCaptured) {
          onLocationCaptured(userLocation.latitude, userLocation.longitude, addr);
        }
      });
    }
  }, [userLocation, captured]);
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <p className="text-sm text-blue-800 font-medium mb-2">
            {warningMessage}
          </p>
          
          {!captured && !userLocation && (
            <button
              onClick={handleCapture}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Capture en cours...
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  Capturer ma position
                </>
              )}
            </button>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          
          {userLocation && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                <CheckCircle size={16} />
                <span className="font-semibold">Position capturée avec succès</span>
              </div>
              
              {loadingAddress ? (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Récupération de l'adresse...</span>
                </div>
              ) : address ? (
                <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded p-2">
                  <p className="font-semibold mb-1">Adresse:</p>
                  <p>{address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordonnées: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

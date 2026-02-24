'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="text-red-600" size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Oups ! Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Réessayer
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
              {this.state.error?.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false })}
                variant="primary"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

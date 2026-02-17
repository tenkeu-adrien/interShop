'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Clock, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Rediriger si le compte est déjà actif
    if (user.accountStatus === 'active') {
      router.push('/dashboard');
      return;
    }

    // Rediriger si le compte est rejeté
    if (user.accountStatus === 'rejected') {
      router.push('/account-rejected');
      return;
    }

    // Rediriger si pas encore vérifié
    if (!user.emailVerified) {
      router.push('/verify-email');
      return;
    }

    if (user.role !== 'client' && !user.phoneVerified) {
      router.push('/verify-phone');
      return;
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 animate-pulse">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compte en attente de validation
          </h1>
          <p className="text-lg text-gray-600">
            Votre compte est en cours de vérification par notre équipe
          </p>
        </div>

        {/* Statut des vérifications */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statut de vérification
          </h2>
          
          <div className="space-y-4">
            {/* Email vérifié */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Email vérifié</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Téléphone vérifié */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {user.phoneVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Téléphone vérifié</p>
                <p className="text-sm text-gray-600">
                  {user.phoneNumber || 'Non renseigné'}
                </p>
              </div>
            </div>

            {/* Validation admin */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Validation administrateur</p>
                <p className="text-sm text-blue-600">En attente de révision</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            📋 Prochaines étapes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Notre équipe examine votre demande d'inscription</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Ce processus prend généralement 24 à 48 heures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Vous recevrez un email dès que votre compte sera validé</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>En cas de rejet, nous vous expliquerons les raisons</span>
            </li>
          </ul>
        </div>

        {/* Informations de contact */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            💬 Besoin d'aide ?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Si vous avez des questions ou si votre demande prend plus de 48 heures, 
            n'hésitez pas à nous contacter :
          </p>
          <div className="space-y-2">
            <a 
              href="mailto:support@shopmark.com"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600"
            >
              <Mail className="w-4 h-4" />
              <span>support@shopmark.com</span>
            </a>
            <a 
              href="tel:+237000000000"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-orange-600"
            >
              <Phone className="w-4 h-4" />
              <span>+237 6 XX XX XX XX</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            Actualiser le statut
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Cette page se rafraîchit automatiquement toutes les 30 secondes
        </p>
      </div>
    </div>
  );
}

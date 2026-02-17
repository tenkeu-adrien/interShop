'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Clock, XCircle, AlertTriangle } from 'lucide-react';

export default function AccountStatusBanner() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  // Ne rien afficher si le compte est actif
  if (user.accountStatus === 'active') return null;

  const getBannerConfig = () => {
    switch (user.accountStatus) {
      case 'email_unverified':
        return {
          icon: <Mail className="w-5 h-5" />,
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          title: 'Vérification email requise',
          message: 'Veuillez vérifier votre adresse email pour activer votre compte.',
          buttonText: 'Vérifier maintenant',
          action: () => router.push('/verify-email')
        };

      case 'phone_unverified':
        return {
          icon: <Phone className="w-5 h-5" />,
          bgColor: 'bg-purple-50 border-purple-200',
          textColor: 'text-purple-900',
          iconColor: 'text-purple-600',
          buttonColor: 'bg-purple-600 hover:bg-purple-700',
          title: 'Vérification téléphone requise',
          message: 'Veuillez vérifier votre numéro de téléphone pour continuer.',
          buttonText: 'Vérifier maintenant',
          action: () => router.push('/verify-phone')
        };

      case 'pending_admin_approval':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          title: 'Compte en attente de validation',
          message: 'Votre compte est en cours de vérification par notre équipe. Vous serez notifié par email une fois approuvé.',
          buttonText: 'Voir le statut',
          action: () => router.push('/pending-approval')
        };

      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          title: 'Compte rejeté',
          message: user.rejectionReason || 'Votre compte n\'a pas été approuvé. Veuillez contacter le support pour plus d\'informations.',
          buttonText: 'Contacter le support',
          action: () => router.push('/contact')
        };

      case 'suspended':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          title: 'Compte suspendu',
          message: 'Votre compte a été suspendu pour raisons de sécurité. Veuillez contacter le support.',
          buttonText: 'Contacter le support',
          action: () => router.push('/contact')
        };

      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <div className={`border-b-2 ${config.bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <div className={config.iconColor}>
              {config.icon}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${config.textColor}`}>
                {config.title}
              </p>
              <p className={`text-sm ${config.textColor} opacity-90`}>
                {config.message}
              </p>
            </div>
          </div>
          <button
            onClick={config.action}
            className={`${config.buttonColor} text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap`}
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

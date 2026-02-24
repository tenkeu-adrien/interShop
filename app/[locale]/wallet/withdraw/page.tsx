'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import PaymentMethodSelector from '@/components/wallet/PaymentMethodSelector';
import FlexibleWithdrawalForm from '@/components/wallet/FlexibleWithdrawalForm';
import type { PaymentMethod, FlexibleWithdrawalData } from '@/types';

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { initiateFlexibleWithdrawal } = useWalletStore();
  
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('form');
  };

  const handleSubmit = async (data: FlexibleWithdrawalData) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await initiateFlexibleWithdrawal(user.id, data);
      setSuccess(true);
      
      // Rediriger vers l'historique après 3 secondes
      setTimeout(() => {
        router.push('/wallet/history');
      }, 3000);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCancel = () => {
    setStep('select');
    setSelectedMethod(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Demande envoyée !
          </h2>
          
          <p className="text-gray-600 mb-6">
            Votre demande de retrait a été envoyée avec succès. 
            Un administrateur va la vérifier et effectuer le paiement.
          </p>
          
          <p className="text-sm text-gray-500">
            Vous serez notifié par email une fois votre retrait traité.
          </p>
          
          <div className="mt-6">
            <button
              onClick={() => router.push('/wallet/history')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Voir l'historique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/wallet')}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au portefeuille
          </button>
        </div>

        {/* Étapes */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'select' ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'select' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Choisir la méthode</span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'form' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Confirmer le retrait</span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        {step === 'select' && (
          <PaymentMethodSelector
            onSelect={handleMethodSelect}
            type="withdrawal"
          />
        )}

        {step === 'form' && selectedMethod && (
          <FlexibleWithdrawalForm
            paymentMethod={selectedMethod}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

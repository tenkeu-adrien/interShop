'use client';

import { useEffect } from 'react';
import {
  Smartphone,
  CreditCard,
  Bitcoin,
  Landmark,
  Wallet,
  CheckCircle2,
  Frown,
  type LucideIcon,
} from 'lucide-react';
import { usePaymentMethodsStore } from '@/store/paymentMethodsStore';
import type { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
  type: 'deposit' | 'withdrawal';
}

// Icônes par type de méthode
const getMethodIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'mobile_money':
      return Smartphone;
    case 'mpesa':
      return CreditCard;
    case 'crypto':
      return Bitcoin;
    case 'bank_transfer':
      return Landmark;
    default:
      return Wallet;
  }
};

function MethodIcon({ type, className }: { type: string; className?: string }) {
  const Icon = getMethodIcon(type);
  return <Icon className={className} />;
}

// Couleur par type
const getMethodColor = (type: string) => {
  switch (type) {
    case 'mobile_money':
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    case 'mpesa':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    case 'crypto':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    case 'bank_transfer':
      return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }
};

export default function PaymentMethodSelector({
  onSelect,
  selectedMethodId,
  type
}: PaymentMethodSelectorProps) {
  const { paymentMethods, loading, error, fetchActivePaymentMethods } = usePaymentMethodsStore();

  useEffect(() => {
    fetchActivePaymentMethods();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 mb-2 flex items-center justify-center gap-2">
          <Frown className="w-5 h-5" /> Aucune méthode de paiement disponible pour le moment
        </p>
        <p className="text-sm text-yellow-700">
          Veuillez réessayer plus tard ou contacter le support.
        </p>
      </div>
    );
  }

  // Grouper par type
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  const typeLabels: Record<string, string> = {
    mobile_money: 'Mobile Money',
    mpesa: 'M-Pesa',
    crypto: 'Cryptomonnaie',
    bank_transfer: 'Virement Bancaire',
    other: 'Autres'
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === 'deposit' ? 'Choisissez votre méthode de dépôt' : 'Choisissez votre méthode de retrait'}
        </h2>
        <p className="text-gray-600">
          Sélectionnez la méthode de paiement que vous souhaitez utiliser
        </p>
      </div>

      {Object.entries(groupedMethods).map(([methodType, methodsList]) => (
        <div key={methodType}>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MethodIcon type={methodType} className="w-6 h-6" />
            {typeLabels[methodType] || methodType}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methodsList.map((method) => (
              <button
                key={method.id}
                onClick={() => onSelect(method)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedMethodId === method.id 
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                    : getMethodColor(method.type)
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {method.icon ? (
                    <img 
                      src={method.icon} 
                      alt={method.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center text-gray-500">
                      <MethodIcon type={method.type} className="w-7 h-7" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {method.instructions.substring(0, 80)}...
                    </p>
                  </div>
                  
                  {selectedMethodId === method.id && (
                    <div className="text-orange-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

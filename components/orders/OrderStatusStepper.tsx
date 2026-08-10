'use client';

import { useTranslations } from 'next-intl';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

const STEPS: { status: OrderStatus; icon: React.ReactNode; labelKey: string }[] = [
  { status: 'pending', icon: <Clock size={16} />, labelKey: 'pending' },
  { status: 'processing', icon: <Package size={16} />, labelKey: 'processing' },
  { status: 'shipped', icon: <Truck size={16} />, labelKey: 'shipped' },
  { status: 'delivered', icon: <CheckCircle size={16} />, labelKey: 'delivered' },
];

function toStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'pending':
    case 'paid':
      return 0;
    case 'processing':
      return 1;
    case 'shipped':
      return 2;
    case 'delivered':
      return 3;
    default:
      return -1;
  }
}

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const t = useTranslations('orders');

  const currentIndex = toStepIndex(status);

  // Status spéciaux (annulé / remboursé)
  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <XCircle size={18} />
        <span className="font-semibold">{status === 'cancelled' ? t('cancelled') : t('refunded')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  reached ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] sm:text-xs text-center leading-tight ${
                  reached ? 'text-green-700 font-semibold' : 'text-gray-400'
                }`}
              >
                {t(step.labelKey)}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded ${
                  index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
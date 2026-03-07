'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const { clearCart } = useCartStore();
  
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear cart after successful checkout
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('success')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          Votre commande a été passée avec succès ! Vous recevrez un email de confirmation sous peu.
        </p>
        
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Numéro de commande</p>
            <p className="font-mono text-lg font-bold text-gray-900">{orderId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Voir mes commandes
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
}

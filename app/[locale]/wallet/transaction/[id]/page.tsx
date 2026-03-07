'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BackButton } from '@/components/ui/BackButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslations } from 'next-intl';
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  fees: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference: string;
  createdAt: any;
  paymentMethodName?: string;
  toUserId?: string;
  fromUserId?: string;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('wallet');
  const tCommon = useTranslations('common');
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    try {
      const txDoc = await getDoc(doc(db, 'transactions', params.id as string));
      if (txDoc.exists()) {
        setTransaction({ id: txDoc.id, ...txDoc.data() } as Transaction);
      } else {
        router.push('/wallet/history');
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (!transaction) return null;

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={48} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={48} />;
      case 'failed':
        return <XCircle className="text-red-500" size={48} />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="text-green-500" size={24} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-red-500" size={24} />;
      case 'transfer':
        return <RefreshCw className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton href="/wallet/history" className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              {getStatusIcon()}
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2">
              <PriceDisplay 
                priceUSD={transaction.amount}
                className="text-white"
              />
            </h1>
            
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              {t(`status_${transaction.status}`)}
            </span>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">{tCommon('date')}</span>
              <span className="font-semibold">
                {transaction.createdAt?.toDate?.().toLocaleString() || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Type</span>
              <div className="flex items-center gap-2">
                {getTypeIcon()}
                <span className="font-semibold capitalize">{transaction.type}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Référence</span>
              <span className="font-mono text-sm font-semibold">{transaction.reference}</span>
            </div>

            {transaction.description && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Description</span>
                <span className="font-semibold text-right">{transaction.description}</span>
              </div>
            )}

            {transaction.paymentMethodName && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">{tCommon('payment_method')}</span>
                <span className="font-semibold">{transaction.paymentMethodName}</span>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Montant</span>
                <PriceDisplay 
                  priceUSD={transaction.amount}
                  className="font-semibold"
                />
              </div>
              
              {transaction.fees > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Frais</span>
                  <PriceDisplay 
                    priceUSD={transaction.fees}
                    className="font-semibold"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-bold">Total</span>
                <PriceDisplay 
                  priceUSD={transaction.totalAmount}
                  className="font-bold text-lg text-green-600"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t">
            <button
              onClick={() => router.push('/wallet')}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              {t('back_to_wallet')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

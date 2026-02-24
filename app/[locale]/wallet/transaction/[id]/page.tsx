'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getTransaction } from '@/lib/firebase/wallet';
import { Transaction } from '@/types';
import { 
  ChevronLeft, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet as WalletIcon,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadTransaction();
  }, [user, params.id, router]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const data = await getTransaction(params.id as string);
      setTransaction(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'payment': return 'Paiement';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => router.push('/wallet/history')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour à l'historique
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Transaction introuvable
            </h2>
            <p className="text-gray-600">{error || 'Cette transaction n\'existe pas'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/wallet/history')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour à l'historique
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Détails de la transaction
          </h1>
        </div>

        {/* Statut */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${getStatusColor(transaction.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Statut</p>
              <p className="text-2xl font-bold">{getStatusLabel(transaction.status)}</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              transaction.type === 'deposit' ? 'bg-green-100' :
              transaction.type === 'withdrawal' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              {transaction.type === 'deposit' ? (
                <ArrowDownCircle className="w-8 h-8 text-green-600" />
              ) : transaction.type === 'withdrawal' ? (
                <ArrowUpCircle className="w-8 h-8 text-red-600" />
              ) : (
                <WalletIcon className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Montant */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{getTypeLabel(transaction.type)}</p>
            <p className={`text-4xl font-bold mb-4 ${
              transaction.type === 'deposit' ? 'text-green-600' :
              transaction.type === 'withdrawal' ? 'text-red-600' :
              'text-gray-900'
            }`}>
              {transaction.type === 'deposit' ? '+' : '-'}
              {transaction.amount.toLocaleString('fr-FR')} FCFA
            </p>
            
            {transaction.fees > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant</span>
                  <span className="font-medium">{transaction.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais</span>
                  <span className="font-medium text-red-600">
                    {transaction.fees.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">
                      {transaction.totalAmount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations
            </h2>
            <div className="space-y-4">
              {/* Référence */}
              {transaction.reference && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Référence</p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <p className="font-mono font-medium text-gray-900">
                      {transaction.reference}
                    </p>
                    <button
                      onClick={() => copyToClipboard(transaction.reference!)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{transaction.description}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-gray-900">
                  {format(transaction.createdAt, 'PPPp', { locale: fr })}
                </p>
              </div>

              {/* Mobile Money */}
              {transaction.mobileMoneyProvider && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Service Mobile Money</p>
                    <p className="text-gray-900 uppercase">
                      {transaction.mobileMoneyProvider} Mobile Money
                    </p>
                  </div>
                  {transaction.mobileMoneyNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Numéro</p>
                      <p className="text-gray-900">{transaction.mobileMoneyNumber}</p>
                    </div>
                  )}
                  {transaction.mobileMoneyTransactionId && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Code de transaction</p>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <p className="font-mono text-sm text-gray-900">
                          {transaction.mobileMoneyTransactionId}
                        </p>
                        <button
                          onClick={() => copyToClipboard(transaction.mobileMoneyTransactionId!)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Validation */}
              {transaction.validatedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Validé le</p>
                  <p className="text-gray-900">
                    {format(transaction.validatedAt, 'PPPp', { locale: fr })}
                  </p>
                </div>
              )}

              {/* Raison de rejet */}
              {transaction.status === 'failed' && transaction.rejectionReason && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Raison du rejet</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{transaction.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message d'aide selon le statut */}
        {transaction.status === 'pending' && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>En attente de validation</strong><br />
              Votre transaction est en cours de traitement par notre équipe. 
              Vous recevrez une notification une fois qu'elle sera validée.
            </p>
          </div>
        )}

        {transaction.status === 'failed' && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Transaction échouée</strong><br />
              Cette transaction n'a pas pu être complétée. 
              Si vous avez des questions, contactez notre support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

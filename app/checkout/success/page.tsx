'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Download, ArrowRight, Loader } from 'lucide-react';
import { getOrder } from '@/lib/firebase/orders';
import { Order } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error('Commande introuvable');
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrder(orderId);
        if (!orderData) {
          toast.error('Commande introuvable');
          router.push('/');
          return;
        }
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-green-100 rounded-full p-6">
            <CheckCircle className="text-green-600" size={64} />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600">
            Merci pour votre achat. Votre commande a été créée avec succès.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Détails de la commande</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Numéro de commande</span>
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </div>
          </div>

          {/* Products */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={20} className="text-green-600" />
              Produits commandés
            </h3>
            <div className="space-y-3">
              {order.products.map((product, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Quantité: {product.quantity}</p>
                  </div>
                  <PriceDisplay 
                    priceUSD={product.price * product.quantity}
                    className="font-semibold text-green-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total</span>
              <PriceDisplay 
                priceUSD={order.subtotal}
                className="font-semibold"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de livraison</span>
              <PriceDisplay 
                priceUSD={order.shippingFee}
                className="font-semibold"
              />
            </div>
            {order.marketingCommission > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction</span>
                <PriceDisplay 
                  priceUSD={-order.marketingCommission}
                  className=""
                />
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <PriceDisplay 
                priceUSD={order.total}
                className="text-green-600"
              />
            </div>
          </div>

          {/* Currency Info */}
          {order.displayCurrency !== 'USD' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Le taux de change a été verrouillé à {order.exchangeRate.toFixed(4)} {order.displayCurrency}/USD
                au moment de la commande.
              </p>
            </div>
          )}

          {/* Shipping Address */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Adresse de livraison</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1">Tél: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </motion.div>

        {/* Status Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold text-yellow-900 mb-2">Prochaines étapes</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Votre commande est en attente de paiement</li>
            <li>• Vous recevrez un email de confirmation</li>
            <li>• Le fournisseur préparera votre commande après paiement</li>
            <li>• Vous serez notifié lors de l'expédition</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link
            href={`/dashboard/client/orders`}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Voir mes commandes
            <ArrowRight size={20} />
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Continuer mes achats
          </Link>
        </motion.div>

        {/* Download Invoice (Placeholder) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            disabled
            className="text-gray-400 text-sm flex items-center gap-2 mx-auto cursor-not-allowed"
          >
            <Download size={16} />
            Télécharger la facture (bientôt disponible)
          </button>
        </motion.div>
      </div>
    </div>
  );
}

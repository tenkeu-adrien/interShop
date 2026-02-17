'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { Order, UserRole } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onUpdateStatus?: (status: string) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  userRole,
  onUpdateStatus
}: OrderDetailsModalProps) {
  if (!isOpen) return null;

  const currencyInfo = SUPPORTED_CURRENCIES[order.displayCurrency];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Commande #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(order.createdAt, 'PPP', { locale: fr })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Statut de la commande</p>
                      <p className="text-lg font-semibold capitalize">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Statut du paiement</p>
                      <p className="text-lg font-semibold capitalize">{order.paymentStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package size={20} />
                    Produits
                  </h3>
                  <div className="space-y-3">
                    {order.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantité: {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            Total: ${(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin size={20} />
                    Adresse de livraison
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shippingAddress.street}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Tél: {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Payment & Currency Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CreditCard size={20} />
                    Informations de paiement
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode de paiement</span>
                      <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    
                    {/* Currency Information */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="font-medium text-sm">Devise de la commande</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Devise affichée</p>
                          <p className="font-medium">
                            {currencyInfo.flag} {currencyInfo.name} ({order.displayCurrency})
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Taux de change verrouillé</p>
                          <p className="font-medium">
                            1 USD = {order.exchangeRate.toFixed(currencyInfo.decimals)} {order.displayCurrency}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total (USD)</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Frais de livraison (USD)</span>
                        <span>${order.shippingFee.toFixed(2)}</span>
                      </div>
                      {order.marketingCommission > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Commission marketing</span>
                          <span>${order.marketingCommission.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total (USD)</span>
                        <span className="text-green-600">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Display Currency Amounts */}
                    {order.displayCurrency !== 'USD' && (
                      <div className="border-t pt-3 space-y-2 bg-blue-50 -m-4 p-4 rounded-b-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          Montants en {currencyInfo.name}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-800">Sous-total</span>
                          <span className="font-medium">
                            {currencyInfo.symbol} {order.displaySubtotal.toFixed(currencyInfo.decimals)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-800">Frais de livraison</span>
                          <span className="font-medium">
                            {currencyInfo.symbol} {order.displayShippingFee.toFixed(currencyInfo.decimals)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-blue-200 pt-2">
                          <span className="text-blue-900">Total</span>
                          <span className="text-blue-900">
                            {currencyInfo.symbol} {order.displayTotal.toFixed(currencyInfo.decimals)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          * Taux de change verrouillé au moment de la commande
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Calendar size={20} />
                      Suivi de livraison
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Numéro de suivi</p>
                      <p className="font-mono font-semibold text-lg">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {onUpdateStatus && (
                  <div className="flex gap-3 pt-4 border-t">
                    {userRole === 'admin' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus('processing')}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Marquer en traitement
                        </button>
                        <button
                          onClick={() => onUpdateStatus('shipped')}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Marquer comme expédié
                        </button>
                      </>
                    )}
                    {userRole === 'fournisseur' && order.status === 'paid' && (
                      <button
                        onClick={() => onUpdateStatus('processing')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Commencer le traitement
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

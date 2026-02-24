'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { createOrder } from '@/lib/firebase/orders';
import { MapPin, CreditCard, Package, ArrowLeft, Loader, Plus } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Address } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, marketingCode, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { selectedCurrency } = useCurrencyStore();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Domicile',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Set default address if user has addresses (only for clients)
    if (user.role === 'client') {
      const clientUser = user as any; // Type assertion temporaire
      if (clientUser.addresses && clientUser.addresses.length > 0) {
        const defaultAddr = clientUser.addresses.find((addr: Address) => addr.isDefault);
        setSelectedAddress(defaultAddr || clientUser.addresses[0]);
      } else {
        // Show form if no addresses and pre-fill with user info
        setShowAddressForm(true);
        setNewAddress({
          label: 'Domicile',
          fullName: user.displayName || '',
          phone: user.phoneNumber || '',
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          isDefault: false,
        });
      }
    } else {
      // Show form for non-client users
      setShowAddressForm(true);
      setNewAddress({
        label: 'Domicile',
        fullName: user.displayName || '',
        phone: user.phoneNumber || '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false,
      });
    }
  }, [user, items, router]);

  const handleAddressInputChange = (field: keyof Address, value: string | boolean) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleUseNewAddress = () => {
    // Validate form
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || 
        !newAddress.city || !newAddress.country || !newAddress.postalCode) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Create temporary address with ID
    const tempAddress: Address = {
      id: 'temp-' + Date.now(),
      label: newAddress.label || 'Domicile',
      fullName: newAddress.fullName!,
      phone: newAddress.phone!,
      street: newAddress.street!,
      city: newAddress.city!,
      state: newAddress.state || '',
      country: newAddress.country!,
      postalCode: newAddress.postalCode!,
      isDefault: false,
    };

    setSelectedAddress(tempAddress);
    setShowAddressForm(false);
    toast.success('Adresse ajoutée');
  };

  const subtotal = getTotal();
  const shippingFee = 10; // Fixed shipping fee for now
  const discount = marketingCode ? subtotal * 0.1 : 0;
  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      toast.error('Veuillez sélectionner une adresse de livraison');
      return;
    }

    setLoading(true);
    try {
      // Create order data - only include marketisteId if there's a marketing code
      const orderData: any = {
        orderNumber: `ORD-${Date.now()}`,
        clientId: user.id,
        fournisseurId: items[0].fournisseurId || 'default-fournisseur',
        products: items.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        marketingCommission: discount,
        platformFee: 0,
        shippingFee,
        total,
        currency: 'USD',
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: 'card',
        shippingAddress: selectedAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only add marketingCode and marketisteId if they exist
      if (marketingCode) {
        orderData.marketingCode = marketingCode;
        // TODO: Get actual marketiste ID from the marketing code
        // For now, we'll leave it out if we don't have it
        // orderData.marketisteId = 'actual-marketiste-id';
      }

      const orderId = await createOrder(orderData, selectedCurrency);
      
      // Clear cart
      clearCart();
      
      toast.success('Commande créée avec succès !');
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} />
            Retour au panier
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-green-600" />
                Adresse de livraison
              </h2>

              {user.role === 'client' && (user as any).addresses && (user as any).addresses.length > 0 ? (
                <div className="space-y-3">
                  {(user as any).addresses.map((address: Address) => (
                    <div
                      key={address.id}
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddressForm(false);
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddress?.id === address.id && !showAddressForm
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.street}</p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          <p className="text-sm text-gray-600 mt-1">Tél: {address.phone}</p>
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Par défaut
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Address Button */}
                  <button
                    onClick={() => {
                      setShowAddressForm(!showAddressForm);
                      if (!showAddressForm) {
                        // Pre-fill with user info when opening form
                        setNewAddress({
                          label: 'Domicile',
                          fullName: user.displayName || '',
                          phone: user.phoneNumber || '',
                          street: '',
                          city: '',
                          state: '',
                          country: '',
                          postalCode: '',
                          isDefault: false,
                        });
                      }
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-green-600 font-medium"
                  >
                    <Plus size={20} />
                    Ajouter une nouvelle adresse
                  </button>
                </div>
              ) : null}

              {/* Address Form */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName || ''}
                        onChange={(e) => handleAddressInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone || ''}
                        onChange={(e) => handleAddressInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+225 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.street || ''}
                      onChange={(e) => handleAddressInputChange('street', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123 Rue de la République"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.city || ''}
                        onChange={(e) => handleAddressInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Abidjan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Région/État
                      </label>
                      <input
                        type="text"
                        value={newAddress.state || ''}
                        onChange={(e) => handleAddressInputChange('state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Lagunes"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.country || ''}
                        onChange={(e) => handleAddressInputChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Côte d'Ivoire"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.postalCode || ''}
                        onChange={(e) => handleAddressInputChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="00225"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Libellé de l'adresse
                    </label>
                    <select
                      value={newAddress.label || 'Domicile'}
                      onChange={(e) => handleAddressInputChange('label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Domicile">Domicile</option>
                      <option value="Bureau">Bureau</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUseNewAddress}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Utiliser cette adresse
                    </button>
                    {user.role === 'client' && (user as any).addresses && (user as any).addresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={24} className="text-green-600" />
                Méthode de paiement
              </h2>

              <div className="space-y-3">
                <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="w-4 h-4 text-green-600"
                    />
                    <div>
                      <p className="font-semibold">Carte bancaire</p>
                      <p className="text-sm text-gray-600">Paiement sécurisé par carte</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-gray-600">Bientôt disponible</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold">Mobile Money</p>
                      <p className="text-sm text-gray-600">Bientôt disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package size={24} className="text-green-600" />
                Résumé de la commande
              </h2>

              {/* Products */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                      <PriceDisplay 
                        priceUSD={item.price * item.quantity}
                        className="text-sm font-semibold text-green-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <PriceDisplay 
                    priceUSD={subtotal}
                    className="font-semibold"
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <PriceDisplay 
                    priceUSD={shippingFee}
                    className="font-semibold"
                  />
                </div>

                {marketingCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction ({marketingCode})</span>
                    <PriceDisplay 
                      priceUSD={-discount}
                      className=""
                    />
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <PriceDisplay 
                    priceUSD={total}
                    className="text-green-600"
                  />
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Traitement...
                  </>
                ) : (
                  'Passer la commande'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                En passant commande, vous acceptez nos conditions générales de vente
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

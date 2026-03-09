'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, Loader } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslations } from 'next-intl';
import { MarketingService } from '@/lib/services/marketingService';
import toast from 'react-hot-toast';

export default function CartPage() {
  const t = useTranslations();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotal, 
    marketingCode, 
    marketingValidation,
    applyMarketingCode,
    removeMarketingCode 
  } = useCartStore();
  
  const [codeInput, setCodeInput] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  const subtotal = getTotal();
  const discount = marketingValidation?.totalDiscount || 0;
  const total = subtotal - discount;

  const handleApplyCode = async () => {
    if (!codeInput.trim()) {
      toast.error(t('cart.enter_code'));
      return;
    }

    setValidatingCode(true);
    console.log('🔍 Validation du code:', codeInput);

    try {
      const validation = await MarketingService.validateMarketingCode(
        codeInput,
        items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      console.log('📊 Résultat de la validation:', validation);

      if (validation.valid) {
        applyMarketingCode(codeInput.toUpperCase(), validation);
        toast.success(`✅ ${validation.message} - Réduction: ${validation.totalDiscount.toFixed(2)} USD`);
        setCodeInput('');
      } else {
        toast.error(`❌ ${validation.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      toast.error(t('cart.error_validating_code'));
    } finally {
      setValidatingCode(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('cart.empty_cart')}</h1>
        <p className="text-gray-600 mb-8">{t('cart.empty_message')}</p>
        <Link
          href="/products"
          className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 inline-block"
        >
          {t('cart.discover_products')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.cart_count')} ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            const applicableProduct = marketingValidation?.applicableProducts[index];
            const hasDiscount = applicableProduct?.canApplyDiscount;
            
            return (
              <div key={item.productId} className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    
                    {hasDiscount ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PriceDisplay 
                            priceUSD={item.price}
                            className="text-gray-400 line-through text-sm"
                          />
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            -{applicableProduct.discountPercentage}%
                          </span>
                        </div>
                        <PriceDisplay 
                          priceUSD={item.price * (1 - applicableProduct.discountPercentage / 100)}
                          className="text-orange-600 font-bold text-lg"
                        />
                      </div>
                    ) : (
                      <PriceDisplay 
                        priceUSD={item.price}
                        className="text-orange-600 font-bold"
                      />
                    )}
                    
                    {item.moq && (
                      <p className="text-sm text-gray-500">MOQ: {item.moq}</p>
                    )}
                    
                    {applicableProduct && !applicableProduct.canApplyDiscount && applicableProduct.reason && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ {applicableProduct.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>

                    <div className="flex items-center gap-2 border rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(item.moq || 1, item.quantity - 1))
                        }
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="font-bold text-xl mb-6">{t('cart.summary')}</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <PriceDisplay 
                  priceUSD={subtotal}
                  className="font-semibold"
                />
              </div>

              {marketingCode && discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discount')} ({marketingCode})</span>
                  <PriceDisplay 
                    priceUSD={-discount}
                    className=""
                  />
                </div>
              )}

              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <PriceDisplay 
                  priceUSD={total}
                  className="text-orange-600"
                />
              </div>
            </div>

            {/* Code promo section */}
            {!marketingCode ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('cart.marketing_code')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
                    placeholder="PROMO2024"
                    disabled={validatingCode}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                  />
                  <button 
                    onClick={handleApplyCode}
                    disabled={validatingCode || !codeInput.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {validatingCode ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        <span className="hidden sm:inline">{t('cart.validating')}</span>
                      </>
                    ) : (
                      t('cart.apply')
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Les réductions sont définies par chaque fournisseur
                </p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-green-800">Code appliqué</p>
                    <p className="text-lg font-bold text-green-900">{marketingCode}</p>
                  </div>
                  <button
                    onClick={removeMarketingCode}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
                {marketingValidation && (
                  <div className="text-xs text-green-700 space-y-1">
                    <p>✅ Réduction: {discount.toFixed(2)} USD</p>
                    <p>💰 Commission marketiste: {marketingValidation.totalCommission.toFixed(2)} USD</p>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/checkout"
              className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              {t('cart.place_order')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


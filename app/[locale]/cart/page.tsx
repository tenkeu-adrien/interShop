'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslations } from 'next-intl';

export default function CartPage() {
  const t = useTranslations();
  const { items, removeItem, updateQuantity, getTotal, marketingCode, removeMarketingCode } =
    useCartStore();

  const subtotal = getTotal();
  const discount = marketingCode ? subtotal * 0.1 : 0; // 10% discount example
  const total = subtotal - discount;

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
          {items.map((item) => (
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
                  <PriceDisplay 
                    priceUSD={item.price}
                    className="text-orange-600 font-bold"
                  />
                  {item.moq && (
                    <p className="text-sm text-gray-500">MOQ: {item.moq}</p>
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
          ))}
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

              {marketingCode && (
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

            {!marketingCode && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder={t('cart.marketing_code')}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />
                <button className="w-full text-orange-600 border border-orange-600 py-2 rounded-lg hover:bg-orange-50">
                  {t('cart.apply')}
                </button>
              </div>
            )}

            {marketingCode && (
              <button
                onClick={removeMarketingCode}
                className="w-full text-red-600 border border-red-600 py-2 rounded-lg hover:bg-red-50 mb-4"
              >
                {t('cart.remove_code')}
              </button>
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

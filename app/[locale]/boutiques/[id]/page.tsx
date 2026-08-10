'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Product } from '@/types';
import { Store, MapPin, Package, Loader, ArrowLeft, Star } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslations } from 'next-intl';

export default function BoutiqueDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const t = useTranslations('boutiques');
  const tCommon = useTranslations('common');

  const [fournisseur, setFournisseur] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', params.id));
        if (userDoc.exists()) {
          const data = userDoc.data() as User;
          setFournisseur({ ...data, id: userDoc.id });
        }

        const productsQuery = query(
          collection(db, 'products'),
          where('fournisseurId', '==', params.id),
          where('isActive', '==', true)
        );
        const productsSnap = await getDocs(productsQuery);
        const items = productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
        setProducts(items);
      } catch (error) {
        console.error('Erreur chargement boutique:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (!fournisseur) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t('not_found')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête boutique */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 py-10">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            {tCommon('back')}
          </button>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {products[0]?.images?.[0] ? (
                <img src={products[0].images[0]} alt={fournisseur.shopName || ''} className="w-full h-full object-cover" />
              ) : (
                <Store size={40} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{fournisseur.shopName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-white/90 text-sm">
                <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  {fournisseur.shopCategory || t('general_shop')}
                </span>
                {(fournisseur.shopLocation?.city || fournisseur.shopLocation?.country) && (
                  <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <MapPin size={14} />
                    {[fournisseur.shopLocation?.city, fournisseur.shopLocation?.country].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Package size={14} />
                  {products.length} {products.length > 1 ? t('products_plural') : t('products')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Devise de la boutique */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {t('shop_currency')}
          </p>
          <span className={`font-bold ${fournisseur.shopCurrency === 'CDF' ? 'text-green-600' : 'text-blue-600'}`}>
            {fournisseur.shopCurrency === 'CDF' ? 'CDF — Franc congolais (FC)' : 'USD — Dollar américain ($)'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">{t('empty_shop')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
                    <img
                      src={product.images?.[0] || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm ml-1">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
                    </div>
                    <PriceDisplay
                      priceUSD={product.prices[0]?.price || 0}
                      currency={product.currency}
                      className="text-lg font-bold text-green-600"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
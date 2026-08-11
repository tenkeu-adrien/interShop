'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { OptimizedProductCard } from '@/components/products/OptimizedProductCard';
import { Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function ClientProducts() {
  const t = useTranslations('client');
  const tCommon = useTranslations('common');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!active) return;
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[]);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package size={18} className="text-green-600" />
          {t('recommended_products')}
        </h2>
        <Link href="/products" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
          {tCommon('view_all')} <ChevronRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <Package className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">{t('no_products')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <OptimizedProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

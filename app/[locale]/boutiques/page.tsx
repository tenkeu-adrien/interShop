'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Product } from '@/types';
import { Store, MapPin, Package, Loader, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

interface ShopWithProducts {
  fournisseur: User;
  products: Product[];
}

export default function BoutiquesPage() {
  const router = useRouter();
  const t = useTranslations('boutiques');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();

  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fournisseurs ayant une boutique
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'fournisseur')
        );
        const usersSnap = await getDocs(usersQuery);
        let fournisseurs = usersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }) as User)
          .filter(u => u.shopName && u.isActive !== false);

        // Un fournisseur connecté ne voit que ses propres boutiques
        if (user?.role === 'fournisseur') {
          fournisseurs = fournisseurs.filter(f => f.id === user.id);
        }

        // Tous les produits actifs (regroupés par fournisseur)
        const productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true)
        );
        const productsSnap = await getDocs(productsQuery);
        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);

        const byFournisseur = new Map<string, Product[]>();
        products.forEach(p => {
          const arr = byFournisseur.get(p.fournisseurId) || [];
          arr.push(p);
          byFournisseur.set(p.fournisseurId, arr);
        });

        const shopList = fournisseurs
          .map(f => ({
            fournisseur: f,
            products: byFournisseur.get(f.id) || [],
          }))
          .sort((a, b) => b.products.length - a.products.length);

        setShops(shopList);
      } catch (error) {
        console.error('Erreur chargement boutiques:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.role]);

  const filtered = shops.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fournisseur.shopName?.toLowerCase().includes(q) ||
      s.fournisseur.shopCategory?.toLowerCase().includes(q) ||
      s.fournisseur.displayName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 py-10">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            {tCommon('back')}
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Store size={32} />
            {t('title')}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-green-600" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <Store className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">{t('no_shops')}</p>
            {!user && (
              <Link
                href="/register"
                className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                {t('open_shop')}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(({ fournisseur, products }, index) => (
              <motion.div
                key={fournisseur.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/boutiques/${fournisseur.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full"
                >
                  {/* En-tête boutique */}
                  <div className="p-5 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      {products[0]?.images?.[0] ? (
                        <img
                          src={products[0].images[0]}
                          alt={fournisseur.shopName || ''}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Store size={28} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{fournisseur.shopName}</h3>
                      <p className="text-xs text-gray-500 truncate">{fournisseur.shopCategory}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {fournisseur.shopCurrency === 'CDF' ? 'CDF (FC)' : 'USD ($)'}
                        </span>
                        {(fournisseur.shopLocation?.city || fournisseur.shopLocation?.country) && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin size={11} />
                            {fournisseur.shopLocation?.city || fournisseur.shopLocation?.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Produits */}
                  <div className="p-5">
                    {products.length > 0 ? (
                      <>
                        <div className="flex gap-2 mb-3">
                          {products.slice(0, 3).map(p => (
                            <img
                              key={p.id}
                              src={p.images?.[0] || '/logo.png'}
                              alt={p.name}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                            />
                          ))}
                          {products.length > 3 && (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-semibold">
                              +{products.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Package size={14} className="text-gray-400" />
                          {products.length} {products.length > 1 ? t('products_plural') : t('products')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">{t('empty_shop')}</p>
                    )}
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
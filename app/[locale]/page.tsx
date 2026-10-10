'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, Target, Trophy, Heart, Flame, Award, Loader2, Star } from 'lucide-react';
import {
  collection,
  query,
  limit,
  getDocs,
  orderBy,
  where,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';

const PAGE_SIZE = 20;

type Filter = 'all' | 'deals' | 'top';

const SORT_FIELD: Record<Filter, string> = {
  all: 'createdAt',
  deals: 'sales',
  top: 'rating',
};

export default function HomePage() {
  const tHome = useTranslations('home');
  const tNav = useTranslations('nav');
  const tClient = useTranslations('client');

  const [filter, setFilter] = useState<Filter>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const loadingRef = useRef(false);
  const requestRef = useRef(0);
  // Passe à vrai si la requête triée échoue (index manquant) : on continue alors sans tri.
  const unsortedRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (activeFilter: Filter, reset: boolean) => {
    if (loadingRef.current && !reset) return;
    const requestId = ++requestRef.current;
    loadingRef.current = true;
    setLoading(true);

    if (reset) {
      lastDocRef.current = null;
      unsortedRef.current = false;
    }

    const fetchPage = () => {
      const constraints: QueryConstraint[] = [where('isActive', '==', true)];
      if (!unsortedRef.current) constraints.push(orderBy(SORT_FIELD[activeFilter], 'desc'));
      if (lastDocRef.current) constraints.push(startAfter(lastDocRef.current));
      constraints.push(limit(PAGE_SIZE));
      return getDocs(query(collection(db, 'products'), ...constraints));
    };

    try {
      let snapshot;
      try {
        snapshot = await fetchPage();
      } catch (error) {
        if (unsortedRef.current || lastDocRef.current) throw error;
        console.warn('Requête triée indisponible, chargement sans tri:', error);
        unsortedRef.current = true;
        snapshot = await fetchPage();
      }

      if (requestId !== requestRef.current) return;

      const page = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? lastDocRef.current;
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setProducts((current) => {
        if (reset) return page;
        const known = new Set(current.map((p) => p.id));
        return [...current, ...page.filter((p) => !known.has(p.id))];
      });
    } catch (error) {
      console.error('Erreur de chargement des produits:', error);
      if (requestId === requestRef.current) setHasMore(false);
    } finally {
      if (requestId === requestRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setProducts([]);
    setHasMore(true);
    loadPage(filter, true);
  }, [filter, loadPage]);

  // Défilement infini : charge la page suivante quand le bas de la liste approche.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) loadPage(filter, false);
      },
      { rootMargin: '600px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filter, hasMore, loadPage, products.length]);

  const tabs = [
    { href: '/', label: tNav('products'), active: true },
    { href: '/boutiques', label: tNav('shops') },
    { href: '/restaurants', label: tNav('restaurants') },
    { href: '/hotels', label: tNav('hotels') },
    { href: '/dating', label: tNav('dating') },
  ];

  const shortcuts = [
    { href: '/categories', icon: LayoutGrid, label: tHome('explore_by_category'), color: 'text-green-600' },
    { href: '/contact', icon: Target, label: tHome('request_quote'), color: 'text-red-500' },
    { href: '/products?sort=rating', icon: Trophy, label: tHome('top_ranking'), color: 'text-yellow-500' },
  ];

  const filters: { id: Filter; label: string; icon: typeof Heart; color: string }[] = [
    { id: 'all', label: tHome('filter_all'), icon: Heart, color: 'text-green-600' },
    { id: 'deals', label: tHome('best_deals'), icon: Flame, color: 'text-red-500' },
    { id: 'top', label: tHome('top_ranking'), icon: Award, color: 'text-yellow-500' },
  ];

  // Trois vignettes « Explorez … » : un produit par catégorie parmi les premiers chargés.
  const highlights = products
    .filter((p, i, all) => p.category && all.findIndex((o) => o.category === p.category) === i)
    .slice(0, 3);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Onglets */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3 whitespace-nowrap border-b-[3px] transition-colors ${
                tab.active
                  ? 'text-lg font-bold text-gray-900 border-green-600'
                  : 'font-semibold text-gray-700 border-transparent hover:text-green-600'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="container mx-auto px-2 sm:px-4">
        {/* Raccourcis */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shrink-0 w-44 sm:w-auto sm:flex-1 hover:shadow-md transition-shadow"
            >
              <shortcut.icon size={30} className={`${shortcut.color} shrink-0`} />
              <span className="text-sm font-semibold text-gray-900 leading-tight">{shortcut.label}</span>
            </Link>
          ))}
        </div>

        {/* Vignettes « Explorez » */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pb-2">
            {highlights.map((product) => (
              <Link
                key={product.id}
                href={`/products?search=${encodeURIComponent(product.category)}`}
                className="bg-white rounded-lg p-2 hover:shadow-md transition-shadow min-w-0"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.category}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                  {product.prices?.[0] && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 rounded-full px-2 py-0.5 text-xs font-bold text-gray-900 whitespace-nowrap max-w-[92%] overflow-hidden">
                      <PriceDisplay priceUSD={product.prices[0].price} currency={product.currency} />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-900 text-center line-clamp-2">
                  {tHome('explore_category', { category: product.category })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white">
        <div className="container mx-auto px-2 sm:px-4 flex gap-2 overflow-x-auto scrollbar-hide py-3">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm whitespace-nowrap shrink-0 transition-colors ${
                filter === item.id
                  ? 'border-2 border-gray-900 font-semibold text-gray-900 bg-white'
                  : 'border-2 border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <item.icon size={16} className={item.color} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Produits */}
      <div className="container mx-auto px-2 sm:px-4 py-2 pb-6">
        {products.length === 0 && loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-16">{tClient('no_products')}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow min-w-0"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-2.5">
                  <h3 className="text-sm text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1 min-w-0">
                    {product.prices?.[0] && (
                      <PriceDisplay
                        priceUSD={product.prices[0].price}
                        currency={product.currency}
                        className="text-base font-bold text-gray-900 whitespace-nowrap"
                      />
                    )}
                    <span className="text-xs text-gray-500 whitespace-nowrap">MOQ: {product.moq}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 min-w-0">
                    <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <span className="truncate">
                      {Number(product.rating || 0).toFixed(1)}
                      {product.country ? ` · ${product.country}` : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-px" />

        {products.length > 0 && loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-green-600" size={28} />
          </div>
        )}
      </div>
    </div>
  );
}

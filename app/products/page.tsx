'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { usePublicProductsStore } from '@/store/publicProductsStore';
import { SearchFilters } from '@/types';
import { Filter, X, Loader } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const sortParam = searchParams.get('sort');
  
  const {
    products,
    loading,
    hasMore,
    filters,
    setFilters,
    setSearchQuery,
    loadProducts,
    loadMore,
    reset
  } = usePublicProductsStore();

  const observerTarget = useRef<HTMLDivElement>(null);

  // Initialiser les filtres et la recherche
  useEffect(() => {
    reset();
    
    if (sortParam) {
      setFilters({ sortBy: sortParam as SearchFilters['sortBy'] });
    } else {
      setFilters({ sortBy: 'newest' });
    }
    
    if (searchQuery) {
      setSearchQuery(searchQuery);
    }
  }, [searchQuery, sortParam]);

  // Intersection Observer pour le scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    setFilters({ ...filters, sortBy });
  };

  const clearSearch = () => {
    window.location.href = '/products';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={20} />
              <h2 className="font-bold text-lg">Filtres</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Prix minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prix maximum</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notation minimum</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) =>
                    setFilters({ ...filters, minRating: Number(e.target.value) })
                  }
                >
                  <option value="">Toutes</option>
                  <option value="4">4+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                  <option value="2">2+ étoiles</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFilters({ ...filters, verifiedOnly: e.target.checked })
                    }
                  />
                  <span className="text-sm">Fournisseurs vérifiés uniquement</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFilters({ ...filters, fastDelivery: e.target.checked })
                    }
                  />
                  <span className="text-sm">Livraison rapide</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {searchQuery ? `Résultats pour "${searchQuery}"` : 'Tous les produits'}
              </h1>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-1"
                >
                  <X size={14} />
                  Effacer la recherche
                </button>
              )}
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
            >
              <option value="newest">Plus récents</option>
              <option value="popular">Plus populaires</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="relevance">Pertinence</option>
            </select>
          </div>

          {loading && products.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des produits...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery 
                  ? `Aucun produit trouvé pour "${searchQuery}"`
                  : 'Aucun produit trouvé'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Voir tous les produits
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                {hasMore && ' (scroll pour charger plus)'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="mt-8 text-center py-8">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Loader className="animate-spin" size={24} />
                    <span>Chargement de plus de produits...</span>
                  </div>
                )}
                {!loading && !hasMore && products.length > 0 && (
                  <p className="text-gray-500">Vous avez vu tous les produits disponibles</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

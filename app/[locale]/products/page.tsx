'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { usePublicProductsStore } from '@/store/publicProductsStore';
import { SearchFilters, Product } from '@/types';
import { Filter, X, Loader, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { searchProductsByImage } from '@/lib/services/imageSearchService';
import Link from 'next/link';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const sortParam = searchParams.get('sort');
  
  // Paramètres de recherche par image
  const isImageSearch = searchParams.get('imageSearch') === 'true';
  const imageLabels = searchParams.get('labels')?.split(',') || [];
  const imageColors = searchParams.get('colors')?.split(',') || [];
  const searchImageUrl = searchParams.get('imageUrl');
  
  const {
    products: storeProducts,
    loading: storeLoading,
    hasMore,
    filters,
    setFilters,
    setSearchQuery,
    loadProducts,
    loadMore,
    reset
  } = usePublicProductsStore();

  // État pour la recherche par image
  const [imageSearchProducts, setImageSearchProducts] = useState<Product[]>([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageSearchError, setImageSearchError] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Charger les résultats de recherche par image
  useEffect(() => {
    if (isImageSearch && imageLabels.length > 0) {
      loadImageSearchResults();
    }
  }, [isImageSearch, imageLabels.join(',')]);

  const loadImageSearchResults = async () => {
    setImageSearchLoading(true);
    setImageSearchError(false);
    try {
      const results = await searchProductsByImage(imageLabels, imageColors);
      setImageSearchProducts(results);
      
      if (results.length === 0) {
        setImageSearchError(true);
      }
    } catch (error) {
      console.error('Error loading image search results:', error);
      setImageSearchError(true);
    } finally {
      setImageSearchLoading(false);
    }
  };

  // Initialiser les filtres et la recherche normale
  useEffect(() => {
    if (!isImageSearch) {
      reset();
      
      if (sortParam) {
        setFilters({ sortBy: sortParam as SearchFilters['sortBy'] });
      } else {
        setFilters({ sortBy: 'newest' });
      }
      
      if (searchQuery) {
        setSearchQuery(searchQuery);
      }
    }
  }, [searchQuery, sortParam, isImageSearch]);

  // Intersection Observer pour le scroll infini (seulement pour recherche normale)
  useEffect(() => {
    if (isImageSearch) return; // Pas de scroll infini pour recherche par image

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !storeLoading) {
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
  }, [hasMore, storeLoading, loadMore, isImageSearch]);

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    setFilters({ ...filters, sortBy });
  };

  const clearSearch = () => {
    window.location.href = '/products';
  };

  // Déterminer quels produits afficher
  const products = isImageSearch ? imageSearchProducts : storeProducts;
  const loading = isImageSearch ? imageSearchLoading : storeLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bannière de recherche par image */}
      {isImageSearch && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              {/* Image recherchée */}
              {searchImageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={searchImageUrl}
                    alt="Image recherchée"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-white shadow-lg"
                  />
                </div>
              )}

              {/* Informations */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Résultats de la recherche par image
                    </h2>
                    <p className="text-gray-600">
                      {loading ? 'Analyse en cours...' : 
                       imageSearchError ? 'Aucun produit trouvé' :
                       `${products.length} produit${products.length > 1 ? 's' : ''} similaire${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Tags détectés */}
                {imageLabels.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      Éléments détectés par l'IA:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imageLabels.map((label, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton pour nouvelle recherche */}
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <X size={18} />
                  Nouvelle recherche
                </button>
              </div>
            </div>
          </div>

          {/* Message si aucun résultat */}
          {imageSearchError && !loading && (
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">
                    Aucun produit correspondant trouvé
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    Nous n'avons pas trouvé de produits correspondant à votre image. 
                    Cela peut être dû à:
                  </p>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1 mb-4">
                    <li>L'image est trop floue ou mal éclairée</li>
                    <li>Le produit n'est pas encore dans notre catalogue</li>
                    <li>L'angle de la photo rend la détection difficile</li>
                  </ul>
                  <p className="text-yellow-800 font-medium">
                    💡 Astuce: Essayez avec une photo plus claire ou consultez nos produits populaires ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

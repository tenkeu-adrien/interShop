'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { usePublicProductsStore } from '@/store/publicProductsStore';
import { SearchFilters, Product } from '@/types';
import { Filter, X, Loader, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { searchProductsByImage } from '@/lib/services/imageSearchService';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ProductsPage() {
  const t = useTranslations();
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
                      {t('products.image_search_results_title')}
                    </h2>
                    <p className="text-gray-600">
                      {loading
                        ? t('products.image_search_loading')
                        : imageSearchError
                          ? t('products.image_search_no_results')
                          : t('products.image_search_results_count', { count: products.length })}
                    </p>
                  </div>
                </div>

                {/* Tags détectés */}
                {imageLabels.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      {t('products.image_search_detected_elements')}
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
                  {t('products.image_search_new_search')}
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
                    {t('products.image_search_no_results_title')}
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    {t('products.image_search_no_results_intro')}
                  </p>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1 mb-4">
                    <li>{t('products.image_search_no_results_reason_blur')}</li>
                    <li>{t('products.image_search_no_results_reason_catalog')}</li>
                    <li>{t('products.image_search_no_results_reason_angle')}</li>
                  </ul>
                  <p className="text-yellow-800 font-medium">
                    {t('products.image_search_no_results_tip')}
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
              <h2 className="font-bold text-lg">{t('products.filters_title')}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('products.min_price')}
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  {t('products.max_price')}
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  {t('products.min_rating')}
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) =>
                    setFilters({ ...filters, minRating: Number(e.target.value) })
                  }
                >
                  <option value="">{t('products.all_ratings')}</option>
                  <option value="4">{t('products.rating_4_plus')}</option>
                  <option value="3">{t('products.rating_3_plus')}</option>
                  <option value="2">{t('products.rating_2_plus')}</option>
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
                  <span className="text-sm">
                    {t('products.verified_only')}
                  </span>
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
                  <span className="text-sm">
                    {t('products.fast_delivery')}
                  </span>
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
                {searchQuery
                  ? t('products.results_for', { search: searchQuery })
                  : t('products.all_products')}
              </h1>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-1"
                >
                  <X size={14} />
                  {t('products.clear_search')}
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
                <p className="mt-4 text-gray-600">
                  {t('products.loading_products')}
                </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                  {searchQuery
                    ? t('products.no_results_for', { search: searchQuery })
                    : t('products.no_results')}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    {t('products.view_all_products')}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {t('products.results_summary', { count: products.length })}
                {hasMore && ` ${t('products.scroll_to_load_more')}`}
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
                    <span>{t('products.loading_more_products')}</span>
                  </div>
                )}
                {!loading && !hasMore && products.length > 0 && (
                  <p className="text-gray-500">
                    {t('products.seen_all_products')}
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

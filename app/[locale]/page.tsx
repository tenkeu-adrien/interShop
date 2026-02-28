'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Truck,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Package,
  Zap,
  Flame,
  Award,
  Tag,
  Clock
} from 'lucide-react';
import { collection, query, limit, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { CategorySelector } from '@/components/CategorySelector';
import { CategoriesSidebar } from '@/components/CategoriesSidebar';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tProducts = useTranslations('products');
  const tAuth = useTranslations('auth');
  const tErrors = useTranslations('errors');

  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [topRanked, setTopRanked] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les différentes sections de produits
  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');

      // Charger en parallèle pour améliorer la performance
      const [bestDealsSnapshot, topRankedSnapshot, newArrivalsSnapshot, restaurantsSnapshot] = await Promise.all([
        getDocs(query(
          productsRef,
          where('isActive', '==', true),
          orderBy('sales', 'desc'),
          limit(12)
        )),
        getDocs(query(
          productsRef,
          where('isActive', '==', true),
          orderBy('rating', 'desc'),
          limit(12)
        )),
        getDocs(query(
          productsRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(12)
        )),
        getDocs(query(
          productsRef,
          where('isActive', '==', true),
          where('serviceCategory', '==', 'restaurant'),
          orderBy('rating', 'desc'),
          limit(6)
        ))
      ]);

      setBestDeals(bestDealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      setTopRanked(topRankedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      setNewArrivals(newArrivalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      setRestaurants(restaurantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);

    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(tErrors('server_error'));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: tNav('electronics'), icon: '💻', color: 'bg-blue-100', link: '/categories/electronique' },
    { name: tNav('fashion'), icon: '👔', color: 'bg-pink-100', link: '/categories/mode' },
    { name: tNav('home_garden'), icon: '🏡', color: 'bg-green-100', link: '/categories/maison-jardin' },
    { name: tNav('sport'), icon: '⚽', color: 'bg-orange-100', link: '/categories/sport-loisirs' },
    { name: tNav('beauty'), icon: '💄', color: 'bg-purple-100', link: '/categories/beaute-sante' },
    { name: tNav('toys'), icon: '🧸', color: 'bg-yellow-100', link: '/categories/jouets-bebe' },
    { name: tNav('automotive'), icon: '🚗', color: 'bg-red-100', link: '/categories/automobile' },
    { name: tNav('food'), icon: '🍔', color: 'bg-green-100', link: '/categories/alimentation' },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {tHome('hero_title')}
                <span className="block text-green-700">{tHome('hero_highlight')}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-800">
                {tHome('hero_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => window.location.href = '/products'}
                  variant="primary"
                  size="lg"
                >
                  {tHome('hero_cta_buy')}
                </Button>
                <Button
                  onClick={() => window.location.href = '/sell'}
                  variant="outline"
                  size="lg"
                >
                  {tHome('hero_cta_sell')}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <TrendingUp className="text-green-600 mb-2" size={32} />
                  <h3 className="font-bold text-2xl mb-1">10M+</h3>
                  <p className="text-gray-600">{tNav('products')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <Users className="text-yellow-500 mb-2" size={32} />
                  <h3 className="font-bold text-2xl mb-1">5M+</h3>
                  <p className="text-gray-600">{tCommon('users')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <Package className="text-green-600 mb-2" size={32} />
                  <h3 className="font-bold text-2xl mb-1">200K+</h3>
                  <p className="text-gray-600">{tNav('suppliers')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <Zap className="text-yellow-500 mb-2" size={32} />
                  <h3 className="font-bold text-2xl mb-1">24/7</h3>
                  <p className="text-gray-600">Support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {tHome('why_choose_us')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: tNav('buyer_protection'), desc: tHome('protection_desc'), color: 'text-green-600' },
              { icon: Truck, title: tNav('shipping'), desc: tHome('shipping_desc'), color: 'text-yellow-500' },
              { icon: DollarSign, title: tHome('competitive_prices'), desc: tHome('prices_desc'), color: 'text-green-600' },
              { icon: Users, title: tHome('millions_users'), desc: tHome('community_desc'), color: 'text-yellow-500' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className={feature.color} size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Selector */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            {tHome('explore_services')}
          </h2>

          {/* Layout avec sidebar et CategorySelector */}
          <div className="flex gap-6">
            {/* Sidebar des catégories */}
            <div className="hidden lg:block flex-shrink-0">
              <CategoriesSidebar />
            </div>

            {/* CategorySelector principal */}
            <div className="flex-1">
              <CategorySelector />
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants populaires */}
      {restaurants.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{tNav('restaurants')}</h2>
                <p className="text-gray-600">{tHome('restaurants_desc')}</p>
              </div>
              <Link
                href="/restaurants"
                className="text-orange-600 hover:text-orange-700 flex items-center gap-2 font-medium group"
              >
                {tCommon('view_all')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RestaurantCard restaurant={restaurant} index={index} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{tHome('categories_title')}</h2>
            <Link
              href="/categories"
              className="text-green-600 hover:text-green-700 flex items-center gap-2 font-medium group"
            >
              {tCommon('view_all')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={cat.link}
                  className={`${cat.color} p-6 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-center block`}
                >
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold text-sm text-gray-900">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meilleures offres - Best Deals */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <Flame className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{tHome('best_deals')}</h2>
                <p className="text-gray-600">{tHome('best_deals_desc')}</p>
              </div>
            </div>
            <Link
              href="/products?sort=sales"
              className="text-red-600 hover:text-red-700 flex items-center gap-2 font-medium group"
            >
              {tCommon('view_all')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {bestDeals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-white border-2 border-red-200 rounded-lg overflow-hidden hover:shadow-2xl hover:border-red-400 transition-all transform hover:scale-105 block group"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        loading="lazy"
                      />
                      {/* Badge Hot Deal */}
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Flame size={12} />
                        HOT
                      </div>
                      {/* Badge de ventes */}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {product.sales}+ {tProducts('sold')}
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {tProducts('out_of_stock')}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 h-10 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-xs text-gray-600">
                          {product.rating.toFixed(1)} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <PriceDisplay
                          priceUSD={product.prices[0].price}
                          className="text-lg font-bold text-red-600"
                        />
                        <span className="text-xs text-gray-500">
                          MOQ: {product.moq}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Produits au top du classement - Top Ranked */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Award className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{tHome('top_products')}</h2>
                <p className="text-gray-600">{tHome('top_products_desc')}</p>
              </div>
            </div>
            <Link
              href="/products?sort=rating"
              className="text-yellow-600 hover:text-yellow-700 flex items-center gap-2 font-medium group"
            >
              {tCommon('view_all')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {topRanked.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-white border-2 border-yellow-200 rounded-lg overflow-hidden hover:shadow-2xl hover:border-yellow-400 transition-all transform hover:scale-105 block group"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        loading="lazy"
                      />
                      {/* Badge Top Rated */}
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Award size={12} />
                        TOP
                      </div>
                      {/* Badge de classement */}
                      {index < 3 && (
                        <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                          #{index + 1}
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {tProducts('out_of_stock')}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 h-10 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <span className="text-sm font-bold text-yellow-600">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount} {tProducts('reviews')})
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <PriceDisplay
                          priceUSD={product.prices[0].price}
                          className="text-lg font-bold text-green-600"
                        />
                        <span className="text-xs text-gray-500">
                          MOQ: {product.moq}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nouveautés - New Arrivals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <Clock className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{tHome('new_products')}</h2>
                <p className="text-gray-600">{tHome('new_products_desc')}</p>
              </div>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-green-600 hover:text-green-700 flex items-center gap-2 font-medium group"
            >
              {tCommon('view_all')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {newArrivals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105 block group"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        loading="lazy"
                      />
                      {/* Badge New */}
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <Tag size={12} />
                        {tHome('badge_new')}
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {tProducts('out_of_stock')}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 h-10 group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-xs text-gray-600">
                          {product.rating.toFixed(1)} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <PriceDisplay
                          priceUSD={product.prices[0].price}
                          className="text-lg font-bold text-green-600"
                        />
                        <span className="text-xs text-gray-500">
                          MOQ: {product.moq}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {tHome('cta_title')}
            </h2>
            <p className="text-xl mb-8">
              {tHome('cta_subtitle')}
            </p>
            <Link
              href="/register"
              className="inline-block"
            >
              <Button variant="secondary" size="lg">
                {tHome('cta_button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

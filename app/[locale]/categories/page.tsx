'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import {
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  Sparkles,
  Baby,
  Car,
  Book,
  Utensils,
  Briefcase,
  Laptop,
  Watch,
  Tv,
  HardHat
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const getCategoryIcon = (name: string) => {
  const icons: Record<string, any> = {
    'electronics': Smartphone,
    'fashion': Shirt,
    'home_garden': Home,
    'sport_leisure': Dumbbell,
    'beauty_health': Sparkles,
    'toys_baby': Baby,
    'automotive': Car,
    'books_media': Book,
    'food': Utensils,
    'office_supplies': Briefcase,
    'computers': Laptop,
    'watches_jewelry': Watch,
    'phones_accessories': Smartphone,
    'home_appliances': Tv,
    'construction_materials': HardHat,
  };
  return icons[name] || Smartphone;
};

// `match` est la valeur réellement stockée dans `product.category`.
// Les liens utilisent cette même valeur (espaces -> tirets) pour que la
// page /categories/[category] retrouve exactement les mêmes produits.
const categoryKeys = [
  { key: 'electronics', match: 'Électronique', color: 'bg-blue-500' },
  { key: 'fashion', match: 'Mode', color: 'bg-pink-500' },
  { key: 'phones_accessories', match: 'Téléphones & Accessoires', color: 'bg-indigo-500' },
  { key: 'home_appliances', match: 'Électroménager', color: 'bg-cyan-500' },
  { key: 'construction_materials', match: 'Matériaux de Construction', color: 'bg-amber-700' },
  { key: 'home_garden', match: 'Maison & Jardin', color: 'bg-green-500' },
  { key: 'sport_leisure', match: 'Sport & Loisirs', color: 'bg-red-500' },
  { key: 'beauty_health', match: 'Beauté & Santé', color: 'bg-purple-500' },
  { key: 'toys_baby', match: 'Jouets & Bébé', color: 'bg-yellow-500' },
  { key: 'automotive', match: 'Automobile', color: 'bg-gray-700' },
  { key: 'books_media', match: 'Livres & Médias', color: 'bg-indigo-400' },
  { key: 'food', match: 'Alimentation', color: 'bg-orange-500' },
  { key: 'office_supplies', match: 'Fournitures Bureau', color: 'bg-teal-500' },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const categorySlug = (label: string) => label.replace(/\s+/g, '-');

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function CategoriesPage() {
  const t = useTranslations();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map((d) => ({ ...d.data() })) as Product[];

        const next: Record<string, number> = {};
        for (const category of categoryKeys) {
          const match = normalize(category.match);
          let count = 0;
          for (const p of products) {
            const productCategory = normalize(p.category || '');
            if (productCategory === match || productCategory.includes(match) || match.includes(productCategory)) {
              count++;
            }
          }
          next[category.key] = count;
        }
        if (!cancelled) setCounts(next);
      } catch (error) {
        console.error('Erreur chargement des catégories:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('categories.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {categoryKeys.map((category, index) => {
            const Icon = getCategoryIcon(category.key);
            return (
              <motion.div
                key={category.key}
                variants={item}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/categories/${categorySlug(category.match)}`}
                  className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                >
                  <div className={`${category.color} p-6 text-white`}>
                    <Icon size={48} className="mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t(`categories.${category.key}`)}</h2>
                    <p className="text-white/90">
                      {loading ? '…' : `${(counts[category.key] ?? 0).toLocaleString()} ${t('categories.products')}`}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                    <span className="text-orange-600 font-semibold flex items-center gap-2">
                      {t('categories.explore')}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Featured Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">{t('categories.not_found_title')}</h2>
          <p className="text-xl mb-6">{t('categories.not_found_subtitle')}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('categories.contact_support')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
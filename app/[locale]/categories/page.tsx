'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
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
  Watch
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
  };
  return icons[name] || Smartphone;
};

const categoryKeys = [
  { key: 'electronics', count: 15420, color: 'bg-blue-500' },
  { key: 'fashion', count: 23150, color: 'bg-pink-500' },
  { key: 'home_garden', count: 18900, color: 'bg-green-500' },
  { key: 'sport_leisure', count: 12340, color: 'bg-red-500' },
  { key: 'beauty_health', count: 9870, color: 'bg-purple-500' },
  { key: 'toys_baby', count: 11200, color: 'bg-yellow-500' },
  { key: 'automotive', count: 8650, color: 'bg-gray-700' },
  { key: 'books_media', count: 7430, color: 'bg-indigo-500' },
  { key: 'food', count: 6890, color: 'bg-orange-500' },
  { key: 'office_supplies', count: 5670, color: 'bg-teal-500' },
  { key: 'computers', count: 14230, color: 'bg-cyan-500' },
  { key: 'watches_jewelry', count: 4560, color: 'bg-amber-500' },
];

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
                  href={`/categories/${category.key.replace(/_/g, '-')}`}
                  className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                >
                  <div className={`${category.color} p-6 text-white`}>
                    <Icon size={48} className="mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t(`categories.${category.key}`)}</h2>
                    <p className="text-white/90">{category.count.toLocaleString()} {t('categories.products')}</p>
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

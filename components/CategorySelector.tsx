'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, UtensilsCrossed, Hotel, Heart } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { ProductCategory } from '@/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const categories = [
  { 
    id: 'ecommerce' as ProductCategory, 
    labelKey: 'home.ecommerce', 
    icon: ShoppingBag, 
    color: 'bg-blue-500',
    route: '/products'
  },
  { 
    id: 'restaurant' as ProductCategory, 
    labelKey: 'nav.restaurants', 
    icon: UtensilsCrossed, 
    color: 'bg-orange-500',
    route: '/restaurants'
  },
  { 
    id: 'hotel' as ProductCategory, 
    labelKey: 'nav.hotels', 
    icon: Hotel, 
    color: 'bg-purple-500',
    route: '/hotels'
  },
  { 
    id: 'dating' as ProductCategory, 
    labelKey: 'nav.dating', 
    icon: Heart, 
    color: 'bg-pink-500',
    route: '/dating'
  },
];

export function CategorySelector() {
  const { setCategory } = useCategoryStore();
  const router = useRouter();
  const t = useTranslations();
  
  const handleCategoryClick = (category: ProductCategory, route: string) => {
    setCategory(category);
    router.push(route);
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {categories.map((cat, index) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleCategoryClick(cat.id, cat.route)}
          className={`${cat.color} p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 text-white`}
        >
          <cat.icon className="mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg">{t(cat.labelKey)}</h3>
        </motion.button>
      ))}
    </div>
  );
}

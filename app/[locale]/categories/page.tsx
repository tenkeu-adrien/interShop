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

const categories = [
  { name: 'Électronique', icon: Smartphone, count: 15420, color: 'bg-blue-500' },
  { name: 'Mode', icon: Shirt, count: 23150, color: 'bg-pink-500' },
  { name: 'Maison & Jardin', icon: Home, count: 18900, color: 'bg-green-500' },
  { name: 'Sport & Loisirs', icon: Dumbbell, count: 12340, color: 'bg-red-500' },
  { name: 'Beauté & Santé', icon: Sparkles, count: 9870, color: 'bg-purple-500' },
  { name: 'Jouets & Bébé', icon: Baby, count: 11200, color: 'bg-yellow-500' },
  { name: 'Automobile', icon: Car, count: 8650, color: 'bg-gray-700' },
  { name: 'Livres & Médias', icon: Book, count: 7430, color: 'bg-indigo-500' },
  { name: 'Alimentation', icon: Utensils, count: 6890, color: 'bg-orange-500' },
  { name: 'Fournitures Bureau', icon: Briefcase, count: 5670, color: 'bg-teal-500' },
  { name: 'Informatique', icon: Laptop, count: 14230, color: 'bg-cyan-500' },
  { name: 'Montres & Bijoux', icon: Watch, count: 4560, color: 'bg-amber-500' },
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Toutes les catégories
          </h1>
          <p className="text-xl text-gray-600">
            Explorez des millions de produits dans toutes les catégories
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                variants={item}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/categories/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                  className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                >
                  <div className={`${category.color} p-6 text-white`}>
                    <Icon size={48} className="mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                    <p className="text-white/90">{category.count.toLocaleString()} produits</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                    <span className="text-orange-600 font-semibold flex items-center gap-2">
                      Explorer
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
          <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-xl mb-6">Contactez-nous et nous vous aiderons à trouver le produit parfait</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contacter le support
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

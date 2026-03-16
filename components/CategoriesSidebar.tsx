'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Laptop, 
  Shirt, 
  Home, 
  Dumbbell, 
  Sparkles, 
  Baby, 
  Car, 
  UtensilsCrossed,
  Hotel,
  Heart,
  ShoppingBag,
  Smartphone,
  Tv,
  HardHat
} from 'lucide-react';

interface Category {
  name: string;
  icon: any;
  link: string;
  subcategories?: string[];
  color: string;
}

const categories: Category[] = [
  {
    name: 'Électronique',
    icon: Laptop,
    link: '/categories/electronique',
    color: 'text-blue-600',
    subcategories: ['Smartphones', 'Ordinateurs', 'Tablettes', 'Accessoires', 'Audio', 'Photo & Vidéo']
  },
  {
    name: 'Téléphones & Accessoires',
    icon: Smartphone,
    link: '/categories/telephones-accessoires',
    color: 'text-indigo-600',
    subcategories: ['Smartphones', 'Téléphones basiques', 'Coques & Protections', 'Chargeurs', 'Écouteurs', 'Câbles & Adaptateurs']
  },
  {
    name: 'Électroménager',
    icon: Tv,
    link: '/categories/electromenager',
    color: 'text-cyan-600',
    subcategories: ['Réfrigérateurs', 'Machines à laver', 'Climatiseurs', 'Cuisinières', 'Téléviseurs', 'Petits appareils']
  },
  {
    name: 'Matériaux de Construction',
    icon: HardHat,
    link: '/categories/materiaux-construction',
    color: 'text-amber-700',
    subcategories: ['Ciment & Béton', 'Fer & Acier', 'Bois & Charpente', 'Carrelage & Revêtement', 'Peinture', 'Plomberie & Électricité']
  },
  {
    name: 'Mode & Vêtements',
    icon: Shirt,
    link: '/categories/mode',
    color: 'text-pink-600',
    subcategories: ['Homme', 'Femme', 'Enfant', 'Chaussures', 'Sacs', 'Accessoires', 'Montres', 'Bijoux']
  },
  {
    name: 'Maison & Jardin',
    icon: Home,
    link: '/categories/maison-jardin',
    color: 'text-green-600',
    subcategories: ['Meubles', 'Décoration', 'Cuisine', 'Jardin', 'Bricolage', 'Électroménager']
  },
  {
    name: 'Sport & Loisirs',
    icon: Dumbbell,
    link: '/categories/sport-loisirs',
    color: 'text-orange-600',
    subcategories: ['Fitness', 'Sports d\'équipe', 'Outdoor', 'Vélos', 'Camping', 'Natation']
  },
  {
    name: 'Beauté & Santé',
    icon: Sparkles,
    link: '/categories/beaute-sante',
    color: 'text-purple-600',
    subcategories: ['Maquillage', 'Soins de la peau', 'Parfums', 'Cheveux', 'Santé', 'Bien-être']
  },
  {
    name: 'Jouets & Bébé',
    icon: Baby,
    link: '/categories/jouets-bebe',
    color: 'text-yellow-600',
    subcategories: ['Jouets', 'Bébé', 'Puériculture', 'Jeux éducatifs', 'Peluches']
  },
  {
    name: 'Automobile',
    icon: Car,
    link: '/categories/automobile',
    color: 'text-red-600',
    subcategories: ['Pièces auto', 'Accessoires', 'Moto', 'Outils', 'Entretien']
  },
  {
    name: 'Alimentation',
    icon: ShoppingBag,
    link: '/categories/alimentation',
    color: 'text-green-700',
    subcategories: ['Épicerie', 'Boissons', 'Bio', 'Snacks', 'Surgelés']
  },
  {
    name: '🍽️ Restaurants',
    icon: UtensilsCrossed,
    link: '/restaurants',
    color: 'text-orange-500',
    subcategories: ['Française', 'Italienne', 'Asiatique', 'Fast-food', 'Végétarien', 'Gastronomique']
  },
  {
    name: '🏨 Hôtels',
    icon: Hotel,
    link: '/hotels',
    color: 'text-blue-500',
    subcategories: ['Hôtels 5★', 'Hôtels 4★', 'Hôtels 3★', 'Auberges', 'Resorts', 'Appartements']
  },
  {
    name: '💕 Rencontres',
    icon: Heart,
    link: '/dating',
    color: 'text-pink-500',
    subcategories: ['Hommes', 'Femmes', 'Profils vérifiés', 'Nouveaux profils']
  },
];

export function CategoriesSidebar() {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 font-bold">
          Toutes les catégories
        </div>
        
        <div className="divide-y divide-gray-100">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                href={category.link}
                className="flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <category.icon className={`${category.color} group-hover:scale-110 transition-transform`} size={20} />
                  <span className="text-gray-700 group-hover:text-green-600 font-medium">
                    {category.name}
                  </span>
                </div>
                {category.subcategories && (
                  <ChevronRight className="text-gray-400 group-hover:text-green-600" size={16} />
                )}
              </Link>

              {/* Submenu */}
              <AnimatePresence>
                {hoveredCategory === index && category.subcategories && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50"
                  >
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {category.subcategories.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            href={`${category.link}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded transition-colors text-sm"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

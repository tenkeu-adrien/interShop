'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
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
  nameKey: string;
  emoji?: string;
  icon: any;
  link: string;
  subcategories?: string[];
  color: string;
}

const categories: Category[] = [
  {
    nameKey: 'electronics',
    icon: Laptop,
    link: '/categories/electronique',
    color: 'text-blue-600',
    subcategories: ['Smartphones', 'Ordinateurs', 'Tablettes', 'Accessoires', 'Audio', 'Photo & Vidéo']
  },
  {
    nameKey: 'phones_accessories',
    icon: Smartphone,
    link: '/categories/telephones-accessoires',
    color: 'text-indigo-600',
    subcategories: ['Smartphones', 'Téléphones basiques', 'Coques & Protections', 'Chargeurs', 'Écouteurs', 'Câbles & Adaptateurs']
  },
  {
    nameKey: 'home_appliances',
    icon: Tv,
    link: '/categories/electromenager',
    color: 'text-cyan-600',
    subcategories: ['Réfrigérateurs', 'Machines à laver', 'Climatiseurs', 'Cuisinières', 'Téléviseurs', 'Petits appareils']
  },
  {
    nameKey: 'construction_materials',
    icon: HardHat,
    link: '/categories/materiaux-construction',
    color: 'text-amber-700',
    subcategories: ['Ciment & Béton', 'Fer & Acier', 'Bois & Charpente', 'Carrelage & Revêtement', 'Peinture', 'Plomberie & Électricité']
  },
  {
    nameKey: 'fashion',
    icon: Shirt,
    link: '/categories/mode',
    color: 'text-pink-600',
    subcategories: ['Homme', 'Femme', 'Enfant', 'Chaussures', 'Sacs', 'Accessoires', 'Montres', 'Bijoux']
  },
  {
    nameKey: 'home_garden',
    icon: Home,
    link: '/categories/maison-jardin',
    color: 'text-green-600',
    subcategories: ['Meubles', 'Décoration', 'Cuisine', 'Jardin', 'Bricolage', 'Électroménager']
  },
  {
    nameKey: 'sport',
    icon: Dumbbell,
    link: '/categories/sport-loisirs',
    color: 'text-orange-600',
    subcategories: ['Fitness', 'Sports d\'équipe', 'Outdoor', 'Vélos', 'Camping', 'Natation']
  },
  {
    nameKey: 'beauty',
    icon: Sparkles,
    link: '/categories/beaute-sante',
    color: 'text-purple-600',
    subcategories: ['Maquillage', 'Soins de la peau', 'Parfums', 'Cheveux', 'Santé', 'Bien-être']
  },
  {
    nameKey: 'toys',
    icon: Baby,
    link: '/categories/jouets-bebe',
    color: 'text-yellow-600',
    subcategories: ['Jouets', 'Bébé', 'Puériculture', 'Jeux éducatifs', 'Peluches']
  },
  {
    nameKey: 'automotive',
    icon: Car,
    link: '/categories/automobile',
    color: 'text-red-600',
    subcategories: ['Pièces auto', 'Accessoires', 'Moto', 'Outils', 'Entretien']
  },
  {
    nameKey: 'food',
    icon: ShoppingBag,
    link: '/categories/alimentation',
    color: 'text-green-700',
    subcategories: ['Épicerie', 'Boissons', 'Bio', 'Snacks', 'Surgelés']
  },
  {
    nameKey: 'restaurants',
    emoji: '🍽️',
    icon: UtensilsCrossed,
    link: '/restaurants',
    color: 'text-orange-500',
    subcategories: ['Française', 'Italienne', 'Asiatique', 'Fast-food', 'Végétarien', 'Gastronomique']
  },
  {
    nameKey: 'hotels',
    emoji: '🏨',
    icon: Hotel,
    link: '/hotels',
    color: 'text-blue-500',
    subcategories: ['Hôtels 5★', 'Hôtels 4★', 'Hôtels 3★', 'Auberges', 'Resorts', 'Appartements']
  },
  {
    nameKey: 'dating',
    emoji: '💕',
    icon: Heart,
    link: '/dating',
    color: 'text-pink-500',
    subcategories: ['Hommes', 'Femmes', 'Profils vérifiés', 'Nouveaux profils']
  },
];

// Les sous-catégories gardent leur libellé français pour l'URL ; seule l'étiquette affichée est traduite.
const subcategoryKey = (label: string) =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export function CategoriesSidebar() {
  const tNav = useTranslations('nav');
  const tHome = useTranslations('home');
  const tSub = useTranslations('subcategories');
  const categoryName = (category: Category) =>
    `${category.emoji ? `${category.emoji} ` : ''}${tNav(category.nameKey)}`;
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 font-bold">
          {tHome('all_categories')}
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
                    {categoryName(category)}
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
                        {categoryName(category)}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {category.subcategories.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            href={`${category.link}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded transition-colors text-sm"
                          >
                            {tSub(subcategoryKey(sub))}
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

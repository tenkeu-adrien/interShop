'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Flame, Award, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface OptimizedProductCardProps {
  product: Product;
  index?: number;
  variant?: 'hot' | 'top' | 'new' | 'default';
}

export function OptimizedProductCard({ product, index = 0, variant = 'default' }: OptimizedProductCardProps) {
  const badges = {
    hot: { icon: Flame, text: 'HOT', color: 'bg-red-500', borderColor: 'border-red-200 hover:border-red-400' },
    top: { icon: Award, text: 'TOP', color: 'bg-yellow-500', borderColor: 'border-yellow-200 hover:border-yellow-400' },
    new: { icon: Tag, text: 'NOUVEAU', color: 'bg-green-500', borderColor: 'border-gray-200' },
    default: { icon: null, text: '', color: '', borderColor: 'border-gray-200' },
  };

  const badge = badges[variant];
  const BadgeIcon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/products/${product.id}`}
        className={`bg-white border-2 ${badge.borderColor} rounded-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 block group`}
      >
        <div className="relative h-48 bg-gray-100">
          <Image
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            loading="lazy"
          />
          
          {/* Badge variant */}
          {BadgeIcon && (
            <div className={`absolute top-2 left-2 ${badge.color} text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md`}>
              <BadgeIcon size={12} />
              {badge.text}
            </div>
          )}

          {/* Badge de ventes pour hot */}
          {variant === 'hot' && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {product.sales}+ vendus
            </div>
          )}

          {/* Badge de classement pour top */}
          {variant === 'top' && index < 3 && (
            <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              #{index + 1}
            </div>
          )}

          {/* Badge rupture de stock */}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md">
              Rupture
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        <div className="p-3">
          <h3 className={`font-medium text-sm text-gray-900 line-clamp-2 mb-2 h-10 transition-colors ${
            variant === 'hot' ? 'group-hover:text-red-600' :
            variant === 'top' ? 'group-hover:text-yellow-600' :
            variant === 'new' ? 'group-hover:text-green-600' :
            'group-hover:text-green-600'
          }`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className={`flex items-center gap-1 mb-2 ${
            variant === 'top' ? 'bg-yellow-50 px-2 py-1 rounded' : ''
          }`}>
            <Star className="text-yellow-400 fill-yellow-400" size={variant === 'top' ? 16 : 14} />
            <span className={`text-xs ${variant === 'top' ? 'font-bold text-yellow-600' : 'text-gray-600'}`}>
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-600">
              ({product.reviewCount}{variant === 'top' ? ' avis' : ''})
            </span>
          </div>

          {/* Prix */}
          <div className="flex flex-col gap-1">
            <PriceDisplay 
              priceUSD={product.prices[0].price}
              className={`text-lg font-bold ${
                variant === 'hot' ? 'text-red-600' : 'text-green-600'
              }`}
            />
            <span className="text-xs text-gray-500">
              MOQ: {product.moq}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

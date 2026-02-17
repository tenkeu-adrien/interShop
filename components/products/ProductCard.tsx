'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, ShoppingCart } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const minPrice = Math.min(...product.prices.map((p) => p.price));

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {product.moq > 1 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              MOQ: {product.moq}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400" size={16} />
              <span className="text-sm ml-1">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400 text-sm">
              ({product.reviewCount} avis)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <PriceDisplay 
                priceUSD={minPrice}
                className="text-orange-600 font-bold text-lg"
              />
              <span className="text-gray-500 text-sm ml-1">/ unité</span>
            </div>
            <button className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors">
              <ShoppingCart size={18} />
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {product.country} • {product.deliveryTime}
          </div>
        </div>
      </div>
    </Link>
  );
}

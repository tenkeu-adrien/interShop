'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTranslations } from 'next-intl';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Review, Product } from '@/types';
import { toDate } from '@/lib/utils/date';
import { Star, ArrowLeft, Loader, MessageSquareQuote } from 'lucide-react';

function FournisseurReviewsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations('accountTabs');
  const tCommon = useTranslations('common');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const productsSnap = await getDocs(
          query(collection(db, 'products'), where('fournisseurId', '==', user.id))
        );
        const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
        const map: Record<string, Product> = {};
        products.forEach((p) => { map[p.id] = p; });
        setProductMap(map);

        const ids = products.map((p) => p.id);
        if (ids.length === 0) {
          setReviews([]);
          return;
        }

        // Firestore 'in' supporte max 10 valeurs par requête
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

        const all: Review[] = [];
        for (const chunk of chunks) {
          const q = query(
            collection(db, 'reviews'),
            where('productId', 'in', chunk),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          all.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[]);
        }
        all.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());
        setReviews(all);
      } catch (error) {
        console.error('Erreur chargement avis:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          className={n <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft size={18} />
            {tCommon('back')}
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquareQuote size={28} className="text-green-600" />
            {t('reviews_title')}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-green-600" size={40} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <Star className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">{t('no_reviews')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const product = productMap[review.productId];
            return (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-semibold text-gray-900">
                      {review.rating.toFixed(1)} / 5
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {toDate(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {product && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={product.images?.[0] || '/logo.png'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                    />
                    <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                  </div>
                )}
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
                  {review.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FournisseurReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur', 'admin']}>
      <FournisseurReviewsContent />
    </ProtectedRoute>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    console.log('🔍 [API Similar Products] GET /api/mobile/products/[id]/similar - Start');
    console.log('📋 [API Similar Products] Product ID:', productId);

    const searchParams = request.nextUrl.searchParams;
    const limitCount = parseInt(searchParams.get('limit') || '6');
    const category = searchParams.get('category');

    if (!category) {
      console.warn('⚠️ [API Similar Products] No category provided');
      return NextResponse.json(
        { error: 'Catégorie requise' },
        { status: 400 }
      );
    }

    console.log('📋 [API Similar Products] Category:', category);
    console.log('📋 [API Similar Products] Limit:', limitCount);

    // Récupérer les produits de la même catégorie
    console.log('🔍 [API Similar Products] Querying Firestore...');
    const q = query(
      collection(db, 'products'),
      where('category', '==', category),
      orderBy('rating', 'desc'),
      firestoreLimit(limitCount + 1) // +1 pour exclure le produit actuel
    );

    const snapshot = await getDocs(q);
    console.log('📦 [API Similar Products] Firestore snapshot size:', snapshot.size);

    const products = snapshot.docs
      .filter(doc => doc.id !== productId) // Exclure le produit actuel
      .slice(0, limitCount) // Limiter au nombre demandé
      .map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      });

    console.log('📦 [API Similar Products] Similar products found:', products.length);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('📦 [API Similar Products] First product:', {
        id: firstProduct.id,
        name: (firstProduct as any).name || 'N/A',
        rating: (firstProduct as any).rating || 0,
      });
    }

    console.log('✅ [API Similar Products] Returning products:', products.length);

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('❌ [API Similar Products] Error:', error);
    console.error('❌ [API Similar Products] Error message:', error.message);
    console.error('❌ [API Similar Products] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

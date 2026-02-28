import { NextRequest, NextResponse } from 'next/server';
import { collection, query, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Featured] GET /api/mobile/products/featured - Start');
    
    const searchParams = request.nextUrl.searchParams;
    const limitCount = parseInt(searchParams.get('limit') || '10');
    
    console.log('📋 [API Featured] Limit:', limitCount);

    // Récupérer TOUS les produits sans filtre
    console.log('🔍 [API Featured] Querying Firestore collection: products');
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );

    console.log('🔍 [API Featured] Executing query...');
    const snapshot = await getDocs(q);
    console.log('📦 [API Featured] Firestore snapshot size:', snapshot.size);
    console.log('📦 [API Featured] Snapshot empty?', snapshot.empty);

    const products = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    console.log('📦 [API Featured] Total products:', products.length);
    if (products.length > 0) {
      const firstProduct = products[0] as any;
      console.log('📦 [API Featured] First product sample:', {
        id: firstProduct.id,
        name: firstProduct.name || 'N/A',
        status: firstProduct.status || 'N/A',
        rating: firstProduct.rating || 0,
      });
      console.log('📦 [API Featured] All products:', products.map((p: any) => ({
        id: p.id,
        name: p.name || 'N/A',
        status: p.status || 'N/A',
      })));
    } else {
      console.warn('⚠️ [API Featured] No products found in Firestore!');
      console.warn('⚠️ [API Featured] Please check Firebase Console:');
      console.warn('⚠️ [API Featured] https://console.firebase.google.com/project/interappshop/firestore/data/products');
    }

    console.log('✅ [API Featured] Returning products:', products.length);

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('❌ [API Featured] Error:', error);
    console.error('❌ [API Featured] Error message:', error.message);
    console.error('❌ [API Featured] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

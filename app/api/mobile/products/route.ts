import { NextRequest, NextResponse } from 'next/server';
import { collection, query, getDocs, orderBy, limit as firestoreLimit, startAfter, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Products] GET /api/mobile/products - Start');
    
    const searchParams = request.nextUrl.searchParams;
    const limitCount = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const lastDocId = searchParams.get('lastDocId');
    const similarTo = searchParams.get('similarTo'); // Pour produits similaires
    
    console.log('📋 [API Products] Params:', { limitCount, category, searchQuery, lastDocId, similarTo });

    let q;
    
    // Si c'est une requête pour produits similaires
    if (similarTo && category) {
      console.log('🔍 [API Products] Fetching similar products for category:', category);
      q = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount + 1) // +1 pour exclure le produit actuel
      );
    }
    // Si on a un lastDocId, on continue la pagination
    else if (lastDocId) {
      console.log('🔍 [API Products] Pagination with lastDocId:', lastDocId);
      const lastDocRef = doc(db, 'products', lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      
      if (!lastDocSnap.exists()) {
        console.warn('⚠️ [API Products] lastDoc not found');
        return NextResponse.json({
          success: true,
          products: [],
          total: 0,
          hasMore: false,
          lastDocId: null,
        });
      }

      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDocSnap),
        firestoreLimit(limitCount)
      );
    }
    // Première requête
    else {
      console.log('🔍 [API Products] Initial query');
      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );
    }

    console.log('🔍 [API Products] Executing query...');
    const snapshot = await getDocs(q);
    console.log('📦 [API Products] Firestore snapshot size:', snapshot.size);

    let allProducts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Exclure le produit actuel si c'est une requête de produits similaires
    if (similarTo) {
      allProducts = allProducts.filter((p: any) => p.id !== similarTo);
      allProducts = allProducts.slice(0, limitCount); // Limiter au nombre demandé
    }

    console.log('📦 [API Products] Total products from Firestore:', allProducts.length);

    // Filtrage côté serveur
    let products = allProducts;

    // Filtre par catégorie si spécifié (et pas déjà filtré pour similaires)
    if (category && category !== 'all' && !similarTo) {
      const beforeFilter = products.length;
      products = products.filter((p: any) => p.category === category);
      console.log(`🔍 [API Products] Category filter (${category}): ${beforeFilter} → ${products.length}`);
    }

    // Filtre par recherche si spécifié
    if (searchQuery) {
      const beforeFilter = products.length;
      const searchLower = searchQuery.toLowerCase();
      products = products.filter((product: any) =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
      console.log(`🔍 [API Products] Search filter (${searchQuery}): ${beforeFilter} → ${products.length}`);
    }

    // Déterminer s'il y a plus de produits
    const hasMore = products.length === limitCount;
    const newLastDocId = products.length > 0 ? products[products.length - 1].id : null;

    console.log('✅ [API Products] Returning:', {
      count: products.length,
      hasMore,
      lastDocId: newLastDocId,
    });

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
      hasMore,
      lastDocId: newLastDocId,
    });
  } catch (error: any) {
    console.error('❌ [API Products] Error:', error);
    console.error('❌ [API Products] Error message:', error.message);
    console.error('❌ [API Products] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

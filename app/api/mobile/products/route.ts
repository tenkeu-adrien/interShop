import { NextRequest, NextResponse } from 'next/server';
import { collection, query, getDocs, orderBy, limit as firestoreLimit, startAfter, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ProductQuerySchema, zodValidate } from '@/lib/validators';
import { searchProducts } from '@/lib/algolia';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Products] GET /api/mobile/products - Start');

    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      limit: searchParams.get('limit') || '20',
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      lastDocId: searchParams.get('lastDocId') || undefined,
      similarTo: searchParams.get('similarTo') || undefined,
    };

    // Validation Zod des paramètres
    const validation = zodValidate(ProductQuerySchema, rawParams);
    if (!validation.success) {
      const errors = validation.errors;
      return NextResponse.json(
        { error: 'Paramètres invalides', details: errors.flatten() },
        { status: 400 }
      );
    }
    const { limit: limitCount, category, search: searchQuery, lastDocId, similarTo } = validation.data;

    console.log('📋 [API Products] Params:', { limitCount, category, searchQuery, lastDocId, similarTo });

    // --- LOGIQUE ALGOLIA POUR LA RECHERCHE ---
    if (searchQuery) {
      console.log(`🚀 [API Products] Using Algolia for search: "${searchQuery}"`);
      try {
        const algoliaResult = await searchProducts(searchQuery, {
          category: category !== 'all' ? category : undefined,
          limit: limitCount,
          page: lastDocId ? parseInt(lastDocId) : 0, // Dans le cas d'Algolia, on pourrait utiliser la page
        });

        return NextResponse.json({
          success: true,
          products: algoliaResult.hits,
          total: algoliaResult.total,
          hasMore: algoliaResult.hasMore,
          lastDocId: algoliaResult.hasMore ? (algoliaResult.currentPage + 1).toString() : null,
          source: 'algolia'
        });
      } catch (algoliaError) {
        console.error('⚠️ [API Products] Algolia search failed, falling back to manual search:', algoliaError);
        // Fallback sur la logique Firestore existante ci-dessous
      }
    }

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

    let allProducts = snapshot.docs.map(doc => {
      const data: any = doc.data();
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

    // Filtrage côté serveur (Fallback pour catégories/search)
    let products = allProducts;

    // Filtre par catégorie si spécifié (et pas déjà filtré pour similaires)
    if (category && category !== 'all' && !similarTo) {
      products = products.filter((p: any) => p.category === category);
    }

    // Filtre par recherche si spécifié (Fallback)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      products = products.filter((product: any) =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = products.length === limitCount;
    const newLastDocId = products.length > 0 ? products[products.length - 1].id : null;

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
      hasMore,
      lastDocId: newLastDocId,
      source: 'firestore'
    });
  } catch (error: any) {
    console.error('❌ [API Products] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}


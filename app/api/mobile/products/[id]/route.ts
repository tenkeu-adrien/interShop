import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    console.log('🔍 [API Product Detail] GET /api/mobile/products/[id] - Start');
    console.log('📋 [API Product Detail] Product ID:', productId);

    if (!productId) {
      console.warn('⚠️ [API Product Detail] No product ID provided');
      return NextResponse.json(
        { error: 'ID produit requis' },
        { status: 400 }
      );
    }

    console.log('🔍 [API Product Detail] Fetching product from Firestore...');
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (!productDoc.exists()) {
      console.warn('⚠️ [API Product Detail] Product not found:', productId);
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    const productData = productDoc.data();
    console.log('📦 [API Product Detail] Product found:', {
      id: productDoc.id,
      name: productData.name,
      category: productData.category,
    });

    const product = {
      id: productDoc.id,
      ...productData,
      createdAt: productData.createdAt?.toDate?.() || productData.createdAt,
      updatedAt: productData.updatedAt?.toDate?.() || productData.updatedAt,
    };

    console.log('✅ [API Product Detail] Returning product');

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('❌ [API Product Detail] Error:', error);
    console.error('❌ [API Product Detail] Error message:', error.message);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

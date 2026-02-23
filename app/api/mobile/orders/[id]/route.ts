import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15+
    const { id: orderId } = await params;

    // Récupérer la commande
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();
    const order = {
      id: orderSnap.id,
      ...orderData,
      createdAt: orderData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

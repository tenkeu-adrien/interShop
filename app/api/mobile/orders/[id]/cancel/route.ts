import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(
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

    // Vérifier si la commande peut être annulée
    const cancellableStatuses = ['pending', 'paid', 'processing'];
    if (!cancellableStatuses.includes(orderData.status)) {
      return NextResponse.json(
        { error: 'Cette commande ne peut plus être annulée' },
        { status: 400 }
      );
    }

    // Annuler la commande
    await updateDoc(orderRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Commande annulée avec succès',
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}

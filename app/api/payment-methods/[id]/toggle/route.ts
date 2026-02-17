import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { togglePaymentMethodStatus } from '@/lib/firebase/paymentMethods';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // TODO: Vérifier que l'utilisateur est admin
    const adminId = sessionCookie.value; // Simplification - à adapter

    await togglePaymentMethodStatus(params.id, adminId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur toggle payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

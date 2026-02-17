import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getAllPaymentMethods, 
  getActivePaymentMethods,
  createPaymentMethod 
} from '@/lib/firebase/paymentMethods';
import type { CreatePaymentMethodData } from '@/types';

/**
 * GET /api/payment-methods
 * Récupère les méthodes de paiement
 * Query params:
 * - status: 'active' (pour clients) ou omis (pour admins - toutes les méthodes)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Si status=active, retourner uniquement les méthodes actives (pour clients)
    if (status === 'active') {
      const methods = await getActivePaymentMethods();
      return NextResponse.json(methods);
    }

    // Sinon, vérifier que l'utilisateur est admin et retourner toutes les méthodes
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on retourne toutes les méthodes
    const methods = await getAllPaymentMethods();
    return NextResponse.json(methods);
  } catch (error: any) {
    console.error('Erreur GET payment-methods:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment-methods
 * Crée une nouvelle méthode de paiement (admin uniquement)
 */
export async function POST(request: NextRequest) {
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

    // Parser les données
    const data: CreatePaymentMethodData = await request.json();

    // Créer la méthode de paiement
    const method = await createPaymentMethod(data, adminId);

    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST payment-methods:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initiateFlexibleDeposit } from '@/lib/firebase/flexibleWallet';
import type { FlexibleDepositData } from '@/types';

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

    // Récupérer l'ID utilisateur depuis la session
    // Note: Vous devrez adapter ceci selon votre système d'authentification
    const userId = sessionCookie.value; // Simplification - à adapter

    // Parser les données JSON
    const data: FlexibleDepositData = await request.json();

    // Validation
    if (!data.paymentMethodId || !data.clientName || !data.amount) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    if (data.amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être positif' },
        { status: 400 }
      );
    }

    if (!data.clientName.trim()) {
      return NextResponse.json(
        { error: 'Le nom du client est obligatoire' },
        { status: 400 }
      );
    }

    // Initier le dépôt
    const transaction = await initiateFlexibleDeposit(userId, data);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

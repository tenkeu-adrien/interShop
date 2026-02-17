import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPendingFlexibleTransactions } from '@/lib/firebase/flexibleWallet';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'deposit' | 'withdrawal' | null;

    console.log('Fetching pending transactions, type:', type);
    
    const transactions = await getPendingFlexibleTransactions(type || undefined);
    
    console.log('Transactions fetched:', transactions?.length || 0);

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Erreur GET pending transactions:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

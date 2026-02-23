import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateFlexibleDeposit, validateFlexibleWithdrawal, getFlexibleTransaction } from '@/lib/firebase/flexibleWallet';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // TODO: Vérifier que l'utilisateur est admin
    const adminId = sessionCookie.value; // Simplification - à adapter

    const { notes } = await request.json();

    // Récupérer la transaction pour savoir si c'est un dépôt ou retrait
    const transaction = await getFlexibleTransaction(id);

    if (transaction.type === 'deposit') {
      await validateFlexibleDeposit(id, adminId, notes);
    } else if (transaction.type === 'withdrawal') {
      await validateFlexibleWithdrawal(id, adminId, notes);
    } else {
      throw new Error('Type de transaction invalide');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur validation transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

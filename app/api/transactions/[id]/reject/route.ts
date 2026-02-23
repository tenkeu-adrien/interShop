import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rejectFlexibleDeposit, rejectFlexibleWithdrawal, getFlexibleTransaction } from '@/lib/firebase/flexibleWallet';

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

    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'La raison du rejet est obligatoire' },
        { status: 400 }
      );
    }

    // Récupérer la transaction pour savoir si c'est un dépôt ou retrait
    const transaction = await getFlexibleTransaction(id);

    if (transaction.type === 'deposit') {
      await rejectFlexibleDeposit(id, adminId, reason);
    } else if (transaction.type === 'withdrawal') {
      await rejectFlexibleWithdrawal(id, adminId, reason);
    } else {
      throw new Error('Type de transaction invalide');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur rejet transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

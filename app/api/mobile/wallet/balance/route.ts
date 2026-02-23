import { NextRequest, NextResponse } from 'next/server';
import { getWallet } from '@/lib/firebase/wallet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId requis' },
        { status: 400 }
      );
    }

    const wallet = await getWallet(userId);

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        currency: wallet.currency,
        status: wallet.status,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getTransactionHistory } from '@/lib/firebase/wallet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as 'deposit' | 'withdrawal' | 'payment' | undefined;
    const status = searchParams.get('status') as 'pending' | 'completed' | 'failed' | undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId requis' },
        { status: 400 }
      );
    }

    const filters: any = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const transactions = await getTransactionHistory(userId, filters);

    return NextResponse.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        fees: t.fees,
        totalAmount: t.totalAmount,
        status: t.status,
        reference: t.reference,
        description: t.description,
        mobileMoneyProvider: t.mobileMoneyProvider,
        mobileMoneyNumber: t.mobileMoneyNumber,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

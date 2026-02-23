import { NextResponse } from 'next/server';
import { getActivePaymentMethods } from '@/lib/firebase/paymentMethods';

export async function GET() {
  try {
    console.log('📱 [API] GET /api/mobile/payment-methods');
    
    const methods = await getActivePaymentMethods();
    
    console.log(`✅ [API] Found ${methods.length} active payment methods`);
    
    return NextResponse.json({
      success: true,
      paymentMethods: methods
    });
  } catch (error: any) {
    console.error('❌ [API] Error fetching payment methods:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des méthodes de paiement'
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { verifyPIN } from '@/lib/firebase/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pin } = body;
    
    console.log('🔐 [API] POST /api/mobile/wallet/pin/verify', { userId });
    
    // Validation
    if (!userId || !pin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants'
        },
        { status: 400 }
      );
    }
    
    // Vérifier le PIN
    const isValid = await verifyPIN(userId, pin);
    
    console.log(`✅ [API] PIN verified for user: ${userId}`);
    
    return NextResponse.json({
      success: true,
      isValid,
      message: 'PIN vérifié avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error verifying PIN:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la vérification du PIN'
      },
      { status: 500 }
    );
  }
}

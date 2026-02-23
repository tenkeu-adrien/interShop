import { NextResponse } from 'next/server';
import { setPIN } from '@/lib/firebase/wallet';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pin } = body;
    
    console.log('🔐 [API] POST /api/mobile/wallet/pin/set', { userId });
    
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
    
    // Valider le format du PIN
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le PIN doit contenir entre 4 et 6 chiffres'
        },
        { status: 400 }
      );
    }
    
    // Définir le PIN (sera hashé dans la fonction)
    await setPIN(userId, pin);
    
    console.log(`✅ [API] PIN set for user: ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'PIN configuré avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error setting PIN:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la configuration du PIN'
      },
      { status: 500 }
    );
  }
}

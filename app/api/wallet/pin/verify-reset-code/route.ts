import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    console.log('🔐 [API] POST /api/wallet/pin/verify-reset-code', { userId });

    // Validation
    if (!userId || !code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants'
        },
        { status: 400 }
      );
    }

    // Récupérer le code de réinitialisation
    const resetCodeRef = doc(db, 'pinResetCodes', userId);
    const resetCodeSnap = await getDoc(resetCodeRef);

    if (!resetCodeSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun code de réinitialisation trouvé'
        },
        { status: 404 }
      );
    }

    const resetCodeData = resetCodeSnap.data();

    // Vérifier si le code a déjà été utilisé
    if (resetCodeData.used) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce code a déjà été utilisé'
        },
        { status: 400 }
      );
    }

    // Vérifier si le code a expiré
    const expiresAt = resetCodeData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce code a expiré'
        },
        { status: 400 }
      );
    }

    // Vérifier le code
    if (resetCodeData.code !== code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code incorrect'
        },
        { status: 400 }
      );
    }

    // Marquer le code comme utilisé
    await updateDoc(resetCodeRef, {
      used: true,
      usedAt: new Date()
    });

    console.log(`✅ [API] Reset code verified for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Code vérifié avec succès'
    });
  } catch (error: any) {
    console.error('❌ [API] Error verifying reset code:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la vérification du code'
      },
      { status: 500 }
    );
  }
}

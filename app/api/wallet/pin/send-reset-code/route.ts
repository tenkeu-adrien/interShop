import { NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sendEmail } from '@/lib/services/emailService';

// Générer un code à 6 chiffres
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, displayName } = body;

    console.log('🔐 [API] POST /api/wallet/pin/send-reset-code', { userId, email });

    // Validation
    if (!userId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants'
        },
        { status: 400 }
      );
    }

    // Générer le code
    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder le code dans Firestore
    await setDoc(doc(db, 'pinResetCodes', userId), {
      code,
      userId,
      email,
      expiresAt,
      used: false,
      createdAt: serverTimestamp()
    });

    // Envoyer l'email
    try {
      const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Réinitialisation de votre code PIN</h2>
            <p>Bonjour ${displayName || 'Utilisateur'},</p>
            <p>Vous avez demandé à réinitialiser votre code PIN de portefeuille.</p>
            <p>Voici votre code de vérification:</p>
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #1F2937; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
            <p style="color: #EF4444; font-weight: bold;">Ce code expire dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #6B7280; font-size: 12px;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        `;
      await sendEmail(
        email,
        'Code de réinitialisation de votre PIN',
        'pin-reset',
        { code, displayName, html: htmlContent }
      );
    } catch (emailError) {
      console.error('❌ [API] Error sending email:', emailError);
      // Continue même si l'email échoue (pour le dev)
    }

    console.log(`✅ [API] Reset code sent for user: ${userId}`);

    // En développement, retourner le code
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: 'Code envoyé par email',
      ...(isDev && { code }) // Retourner le code seulement en dev
    });
  } catch (error: any) {
    console.error('❌ [API] Error sending reset code:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code'
      },
      { status: 500 }
    );
  }
}

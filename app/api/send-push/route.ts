import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export const runtime = 'nodejs';

// POST /api/send-push
// Envoie une notification push FCM à tous les tokens enregistrés d'un utilisateur.
// Nécessite firebase-admin configuré (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
// Sans configuration, renvoie une erreur gérée côté client (la notification in-app reste envoyée).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, body: messageBody, data } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, error: 'userId and title are required' },
        { status: 400 }
      );
    }

    // Vérifier que Firebase Admin est bien initialisé
    if (!admin.apps.length) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin SDK not configured' },
        { status: 503 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const tokens: string[] = userDoc.data()?.fcmTokens || [];
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ success: false, error: 'No FCM tokens registered' }, { status: 200 });
    }

    const message = {
      tokens,
      notification: {
        title,
        body: messageBody || '',
        icon: '/logo.png',
      },
      data: { ...(data || {}), click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return NextResponse.json({
      success: true,
      response: {
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
    });
  } catch (error: any) {
    console.error('Erreur envoi push FCM:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Push sending failed' },
      { status: 500 }
    );
  }
}
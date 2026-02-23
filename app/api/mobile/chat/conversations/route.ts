import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, getOrCreateConversation } from '@/lib/firebase/chat';

// GET /api/mobile/chat/conversations - Get user conversations
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

    const conversations = await getUserConversations(userId);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/mobile/chat/conversations - Create or get conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId1, userId2, user1Data, user2Data, productContext, context } = body;

    if (!userId1 || !userId2 || !user1Data || !user2Data) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const conversationId = await getOrCreateConversation(
      userId1,
      userId2,
      user1Data,
      user2Data,
      productContext
    );

    return NextResponse.json({
      success: true,
      conversationId,
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

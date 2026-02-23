import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/firebase/chat';

// GET /api/mobile/chat/conversations/[id] - Get conversation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id: conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId requis' },
        { status: 400 }
      );
    }

    const conversation = await getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

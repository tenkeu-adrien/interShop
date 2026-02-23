import { NextRequest, NextResponse } from 'next/server';
import { getConversationMessages, sendMessage, markMessagesAsRead } from '@/lib/firebase/chat';

// GET /api/mobile/chat/messages - Get conversation messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId requis' },
        { status: 400 }
      );
    }

    const messages = await getConversationMessages(conversationId, limit);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/mobile/chat/messages - Send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      senderId,
      senderName,
      senderPhoto,
      receiverId,
      content,
      type = 'text',
      fileUrl,
      fileName,
      fileSize,
      thumbnailUrl,
      productReference,
    } = body;

    if (!conversationId || !senderId || !senderName || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const messageId = await sendMessage(
      conversationId,
      senderId,
      senderName,
      senderPhoto,
      receiverId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      thumbnailUrl,
      productReference
    );

    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/mobile/chat/messages - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    await markMessagesAsRead(conversationId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

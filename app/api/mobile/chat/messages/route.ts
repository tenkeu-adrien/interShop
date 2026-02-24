import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, getConversationMessages } from '@/lib/firebase/chat';

// POST - Send message
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
        { success: false, error: 'Missing required fields' },
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
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Get conversation messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const messages = await getConversationMessages(conversationId, limit);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

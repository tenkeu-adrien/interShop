import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation, getUserConversations } from '@/lib/firebase/chat';

// POST - Create or get conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId1, userId2, user1Data, user2Data, context, productContext } = body;

    if (!userId1 || !userId2 || !user1Data || !user2Data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conversationId = await getOrCreateConversation(
      userId1,
      userId2,
      user1Data,
      user2Data,
      context,
      productContext
    );

    return NextResponse.json({
      success: true,
      conversationId,
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

// GET - Get user conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const conversations = await getUserConversations(userId);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

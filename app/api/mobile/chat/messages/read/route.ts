import { NextRequest, NextResponse } from 'next/server';
import { markMessagesAsRead } from '@/lib/firebase/chat';

// POST - Mark messages as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await markMessagesAsRead(conversationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}

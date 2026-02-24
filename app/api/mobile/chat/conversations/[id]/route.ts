import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/firebase/chat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await getConversation(id);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

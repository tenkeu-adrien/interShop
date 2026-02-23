import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserNotifications, 
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '@/lib/firebase/notifications';

// GET /api/mobile/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'list' or 'unreadCount'
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (action === 'unreadCount') {
      const count = await getUnreadCount(userId);
      return NextResponse.json({ 
        success: true, 
        data: { count } 
      });
    }

    // Default: list notifications
    const notifications = await getUserNotifications(userId, limit);
    return NextResponse.json({ 
      success: true, 
      data: notifications 
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/mobile/notifications - Mark notification(s) as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, notificationId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required' },
        { status: 400 }
      );
    }

    if (action === 'markAsRead') {
      if (!notificationId) {
        return NextResponse.json(
          { success: false, error: 'notificationId is required' },
          { status: 400 }
        );
      }
      await markNotificationAsRead(notificationId);
      return NextResponse.json({ 
        success: true, 
        message: 'Notification marked as read' 
      });
    }

    if (action === 'markAllAsRead') {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'userId is required' },
          { status: 400 }
        );
      }
      await markAllNotificationsAsRead(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications marked as read' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

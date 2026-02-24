import { NextRequest, NextResponse } from 'next/server';
import { getDatingProfile } from '@/lib/firebase/datingProfiles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getDatingProfile(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Dating profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      profile: profile 
    });
  } catch (error: any) {
    console.error('Error fetching dating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dating profile' },
      { status: 500 }
    );
  }
}

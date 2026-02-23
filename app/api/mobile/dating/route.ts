import { NextRequest, NextResponse } from 'next/server';
import { getDatingProfiles } from '@/lib/firebase/datingProfiles';

export async function GET(request: NextRequest) {
  try {
    const profiles = await getDatingProfiles();

    return NextResponse.json({ 
      success: true, 
      data: profiles 
    });
  } catch (error: any) {
    console.error('Error fetching dating profiles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dating profiles' },
      { status: 500 }
    );
  }
}

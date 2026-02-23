import { NextRequest, NextResponse } from 'next/server';
import { getDatingProfiles } from '@/lib/firebase/datingProfiles';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const gender = searchParams.get('gender') || undefined;
    const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!) : undefined;
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const profiles = await getDatingProfiles({
      city,
      gender,
      minAge,
      maxAge,
    });

    // Limit results
    const limitedProfiles = profiles.slice(0, limit);

    return NextResponse.json({
      success: true,
      profiles: limitedProfiles,
      count: limitedProfiles.length,
    });
  } catch (error) {
    console.error('Error fetching dating profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dating profiles' },
      { status: 500 }
    );
  }
}

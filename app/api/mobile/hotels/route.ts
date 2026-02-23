import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '@/lib/firebase/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const features = searchParams.get('features')?.split(',') || undefined;
    const starRating = searchParams.get('starRating') ? parseInt(searchParams.get('starRating')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const hotels = await getProductsByCategory('hotel', {
      city,
      features,
      limitCount: limit,
    });

    // Filter by star rating if provided
    const filteredHotels = starRating
      ? hotels.filter(h => h.hotelData?.starRating === starRating)
      : hotels;

    return NextResponse.json({
      success: true,
      hotels: filteredHotels,
      count: filteredHotels.length,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

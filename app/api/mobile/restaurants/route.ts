import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '@/lib/firebase/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const priceRange = searchParams.get('priceRange') || undefined;
    const features = searchParams.get('features')?.split(',') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const restaurants = await getProductsByCategory('restaurant', {
      city,
      priceRange,
      features,
      limitCount: limit,
    });

    return NextResponse.json({
      success: true,
      restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

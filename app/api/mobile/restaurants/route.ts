import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '@/lib/firebase/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || undefined;
    const priceRange = searchParams.get('priceRange') || undefined;
    const features = searchParams.get('features')?.split(',') || undefined;
    const maxDistance = searchParams.get('maxDistance') 
      ? Number(searchParams.get('maxDistance')) 
      : undefined;
    
    // Get user location if provided
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const userLocation = lat && lng 
      ? { lat: Number(lat), lng: Number(lng) }
      : undefined;

    const restaurants = await getProductsByCategory('restaurant', {
      city,
      priceRange,
      features,
      userLocation,
      maxDistance,
    });

    return NextResponse.json({ 
      success: true, 
      data: restaurants 
    });
  } catch (error: any) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

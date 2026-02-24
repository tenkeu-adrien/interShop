import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/firebase/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurant = await getProduct(id);

    if (!restaurant || restaurant.serviceCategory !== 'restaurant') {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      restaurant: restaurant 
    });
  } catch (error: any) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/firebase/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotel = await getProduct(id);

    if (!hotel || hotel.serviceCategory !== 'hotel') {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      hotel: hotel 
    });
  } catch (error: any) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { readStock } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const stock = readStock();
    
    if (productId) {
      const productStock = stock.filter(s => s.productId === productId);
      return NextResponse.json({ success: true, stock: productStock }, { status: 200 });
    }

    return NextResponse.json({ success: true, stock }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stock API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

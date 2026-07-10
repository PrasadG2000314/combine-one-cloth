import { NextResponse } from 'next/server';
import { readProductsCatalog } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    const catalog = readProductsCatalog();

    if (slug) {
      const product = catalog.find(p => p.slug === slug);
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Product not found.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, product }, { status: 200 });
    }

    if (category) {
      // Filter by category
      const filtered = catalog.filter(p => p.category === category || p.collection.includes(category));
      return NextResponse.json({ success: true, products: filtered }, { status: 200 });
    }

    return NextResponse.json({ success: true, products: catalog }, { status: 200 });
  } catch (error) {
    console.error('Error fetching storefront products API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

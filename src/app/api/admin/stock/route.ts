import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { readStock, writeStock } from '@/lib/db';

function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/admin_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return validateSession(token);
}

// PATCH - Update inventory count for a specific variation (productId, color, size)
export async function PATCH(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized access.' },
      { status: 401 }
    );
  }

  try {
    const { productId, color, size, quantity } = await request.json();

    if (!productId || !color || !size || quantity === undefined || quantity === null) {
      return NextResponse.json(
        { success: false, message: 'Missing product details or quantity.' },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be a non-negative number.' },
        { status: 400 }
      );
    }

    const stock = readStock();
    const idx = stock.findIndex(
      s => s.productId === productId && s.color === color && s.size === size
    );

    if (idx === -1) {
      // Create new record if variation was somehow missing
      stock.push({ productId, color, size, quantity: qty });
    } else {
      stock[idx].quantity = qty;
    }

    writeStock(stock);

    return NextResponse.json(
      { success: true, message: 'Inventory updated successfully.', stock },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating inventory status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

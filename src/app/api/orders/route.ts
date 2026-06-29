import { NextResponse } from 'next/server';
import { readOrders, writeOrders, Order, OrderItem } from '@/lib/db';
import { products } from '@/data/products';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, paymentMethod } = body;

    // 1. Validate Customer Info
    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !customer.city || !customer.postalCode) {
      return NextResponse.json(
        { message: 'Missing required customer details.' },
        { status: 400 }
      );
    }

    // 2. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // 3. Compute totals server-side using database prices (protect against client modifications)
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const serverProduct = products.find(p => p.id === item.productId);
      if (!serverProduct) {
        return NextResponse.json(
          { message: `Product with ID ${item.productId} not found.` },
          { status: 400 }
        );
      }

      // Ensure valid color and size
      const sizeValid = serverProduct.sizes.includes(item.size);
      const colorValid = serverProduct.colors.some(c => c.name === item.color);
      
      if (!sizeValid || !colorValid) {
        return NextResponse.json(
          { message: `Invalid color/size combination selected for ${serverProduct.name}.` },
          { status: 400 }
        );
      }

      // Quantity check
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { message: `Invalid quantity for ${serverProduct.name}.` },
          { status: 400 }
        );
      }

      const itemTotal = serverProduct.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: serverProduct.id,
        name: serverProduct.name,
        price: serverProduct.price,
        quantity: qty,
        color: item.color,
        size: item.size,
        image: serverProduct.images[0] || '',
      });
    }

    // 4. Calculate Shipping and Grand Total
    const shipping = subtotal >= 9999 ? 0 : 350;
    const total = subtotal + shipping;

    // 5. Generate a unique, non-predictable Order ID
    const orders = readOrders();
    let orderId = '';
    let isUnique = false;

    while (!isUnique) {
      const rand = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
      orderId = `VL-${rand}`;
      isUnique = !orders.some(o => o.id === orderId);
    }

    const newOrder: Order = {
      id: orderId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        postalCode: customer.postalCode.trim(),
      },
      items: validatedItems,
      subtotal,
      shipping,
      total,
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // 6. Save order in db
    orders.push(newOrder);
    writeOrders(orders);

    return NextResponse.json(
      { message: 'Order created successfully.', order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing order checkout:', error);
    return NextResponse.json(
      { message: 'Internal server error while processing order.' },
      { status: 500 }
    );
  }
}

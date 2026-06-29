import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { readOrders, writeOrders, Order } from '@/lib/db';

// Helper to check if request is authenticated
function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/admin_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return validateSession(token);
}

// GET - Retrieve all orders
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized access. Session invalid or expired.' },
      { status: 401 }
    );
  }

  try {
    const orders = readOrders();
    // Sort orders by newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (Confirm or Reject)
export async function PATCH(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized access. Session invalid or expired.' },
      { status: 401 }
    );
  }

  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    if (status !== 'Confirmed' && status !== 'Rejected' && status !== 'Pending') {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status
    orders[orderIndex].status = status;
    writeOrders(orders);

    return NextResponse.json(
      { success: true, message: `Order status updated to ${status}`, order: orders[orderIndex] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an order record
export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized access. Session invalid or expired.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Remove from array
    orders.splice(orderIndex, 1);
    writeOrders(orders);

    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { readComments, writeComments, ProductComment } from '@/lib/db';

// GET - Retrieve all approved reviews for a specific product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Missing productId parameter.' },
        { status: 400 }
      );
    }

    const comments = readComments();
    const approvedCommentsForProduct = comments
      .filter(c => c.productId === productId && c.status === 'Approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, comments: approvedCommentsForProduct }, { status: 200 });
  } catch (error) {
    console.error('Error fetching storefront comments:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// POST - Customer submits a review/comment (moderated by default)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, customerName, email, rating, content } = body;

    // Validation
    if (!productId || !customerName || !email || !rating || !content) {
      return NextResponse.json(
        { success: false, message: 'All review fields are required.' },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const comments = readComments();
    
    // Generate a unique ID
    const newId = `cmt-${Math.floor(100000 + Math.random() * 900000)}`;

    const newComment: ProductComment = {
      id: newId,
      productId,
      customerName: customerName.trim(),
      email: email.trim(),
      rating: ratingNum,
      content: content.trim(),
      status: 'Pending', // Moderated by default for security
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    writeComments(comments);

    return NextResponse.json(
      { success: true, message: 'Review submitted successfully and is pending moderation.', comment: newComment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

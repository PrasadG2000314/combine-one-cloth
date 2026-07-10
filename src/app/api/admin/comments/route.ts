import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { readComments, writeComments } from '@/lib/db';

function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/admin_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return validateSession(token);
}

// GET - Retrieve all comments (approved, rejected, pending) for admin
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const comments = readComments();
    // Sort by newest first
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, comments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH - Update comment moderation status (Approved / Rejected)
export async function PATCH(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { commentId, status } = await request.json();

    if (!commentId || !status) {
      return NextResponse.json({ success: false, message: 'Missing commentId or status.' }, { status: 400 });
    }

    if (status !== 'Approved' && status !== 'Rejected' && status !== 'Pending') {
      return NextResponse.json({ success: false, message: 'Invalid status value.' }, { status: 400 });
    }

    const comments = readComments();
    const idx = comments.findIndex(c => c.id === commentId);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Comment not found.' }, { status: 404 });
    }

    comments[idx].status = status;
    writeComments(comments);

    return NextResponse.json({ success: true, message: `Review status updated to ${status}.`, comment: comments[idx] }, { status: 200 });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a comment record
export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ success: false, message: 'Missing commentId parameter.' }, { status: 400 });
    }

    const comments = readComments();
    const idx = comments.findIndex(c => c.id === commentId);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Comment not found.' }, { status: 404 });
    }

    comments.splice(idx, 1);
    writeComments(comments);

    return NextResponse.json({ success: true, message: 'Review deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

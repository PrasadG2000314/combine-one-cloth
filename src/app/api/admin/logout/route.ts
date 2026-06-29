import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Read session token from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/admin_session=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
      destroySession(token);
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Delete cookie by setting maxAge to 0
    response.cookies.set({
      name: 'admin_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during admin logout api:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

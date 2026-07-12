import { NextResponse } from 'next/server';
import { verifyAdminLogin, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    let { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Clean up passcode: trim whitespace/newlines and remove 'Password:' prefix if copied accidentally
    password = password.trim();
    if (password.startsWith('Password:')) {
      password = password.substring('Password:'.length).trim();
    }

    const isValid = verifyAdminLogin(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // Generate secure session token
    const token = createSession('admin');

    // Create secure HttpOnly Cookie
    const response = NextResponse.json(
      { success: true, message: 'Authenticated successfully' },
      { status: 200 }
    );

    // Set HttpOnly, Secure, SameSite=Strict cookie for max security
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during admin login api:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

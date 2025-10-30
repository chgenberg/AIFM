import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const REQUIRED_PASSWORD = 'AIFM';
const GATE_COOKIE_NAME = 'aifm_gate_access';
const GATE_COOKIE_VALUE = 'granted';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * POST /api/password-gate
 * Verify password and set access cookie
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === REQUIRED_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(GATE_COOKIE_NAME, GATE_COOKIE_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Password gate error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/password-gate
 * Check if user has access
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(GATE_COOKIE_NAME)?.value === GATE_COOKIE_VALUE;

  return NextResponse.json({ hasAccess });
}


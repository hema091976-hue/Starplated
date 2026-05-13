import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// This route signs out the current user and then redirects them to the magic link.
// This ensures no session bleeding when a new restaurant activates their account.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const link = searchParams.get('link');

  if (!link) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Sign out the current session using the server client
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Now redirect to the magic link, which will create a fresh new session
  return NextResponse.redirect(link);
}

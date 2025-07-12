import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to the chat page after successful authentication
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // If there's no code, redirect to the sign-in page
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
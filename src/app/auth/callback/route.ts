import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  if (code) {
    try {
      const supabase = createServerSupabase()
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
      }
      
      if (data.user) {
        // Check if user has a workspace
        const { data: workspaceMember, error: workspaceError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        
        if (workspaceError) {
          console.error('Workspace check error:', workspaceError)
        }
        
        // If user doesn't have a workspace, redirect to onboarding
        if (!workspaceMember) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        
        // User has workspace, redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }
  
  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}

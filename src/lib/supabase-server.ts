import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// サーバーサイド用
export const createServerSupabase = () => 
  createServerComponentClient<Database>({ cookies })

// サービスロール用（管理者操作）
export const createServiceSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 既存のヘルパー関数をすべてここに移動
export async function getCurrentUser() {
  const supabase = createServerSupabase()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getCurrentWorkspace(userId: string) {
  const supabase = createServerSupabase()
  
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        workspaces (
          id,
          name,
          slug,
          description,
          owner_id
        )
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching workspace:', error)
    return null
  }
}

export async function getProjects(workspaceId: string) {
  const supabase = createServerSupabase()
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export async function getPromptTemplates(workspaceId: string) {
  const supabase = createServerSupabase()
  
  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching prompt templates:', error)
    return []
  }
}

export async function getApiSettings(workspaceId: string) {
  const supabase = createServerSupabase()
  
  try {
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    return data
  } catch (error) {
    console.error('Error fetching API settings:', error)
    return null
  }
}

export async function getExecutionLogs(projectId: string) {
  const supabase = createServerSupabase()
  
  try {
    const { data, error } = await supabase
      .from('execution_logs')
      .select(`
        *,
        prompt_templates (
          title,
          phase
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching execution logs:', error)
    return []
  }
} 
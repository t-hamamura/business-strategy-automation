import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getCurrentUser } from '@/lib/supabase-server'
import { z } from 'zod'

// API設定作成・更新用のスキーマ
const apiSettingsSchema = z.object({
  workspace_id: z.string().uuid('有効なワークスペースIDが必要です'),
  gemini_api_key: z.string().optional(),
  notion_api_token: z.string().optional(),
  notion_database_id: z.string().optional(),
  api_rate_limit: z.number().int().min(1).max(1000).default(60),
  execution_delay: z.number().int().min(1).max(300).default(30)
})

// API設定取得
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // ユーザーがワークスペースのメンバーかどうかを確認
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // API設定を取得
    const { data: settings, error } = await supabase
      .from('api_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()

    if (error && error.code !== 'PGRST116') { // "not found" エラー以外
      throw error
    }

    // 設定が存在しない場合はデフォルト値を返す
    if (!settings) {
      return NextResponse.json({
        settings: {
          workspace_id: workspaceId,
          gemini_api_key: null,
          notion_api_token: null,
          notion_database_id: null,
          api_rate_limit: 60,
          execution_delay: 30
        }
      })
    }

    // セキュリティのためAPIキーはマスクして返す
    const maskedSettings = {
      ...settings,
      gemini_api_key: settings.gemini_api_key ? '********' : null,
      notion_api_token: settings.notion_api_token ? '********' : null
    }

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error('Get API settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// API設定作成・更新
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = apiSettingsSchema.parse(body)

    const supabase = createServerSupabase()

    // ユーザーがワークスペースのメンバーかどうかを確認
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', validatedData.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 管理者権限の確認
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 既存の設定を確認
    const { data: existingSettings, error: existingError } = await supabase
      .from('api_settings')
      .select('id')
      .eq('workspace_id', validatedData.workspace_id)
      .single()

    let settings
    if (existingError && existingError.code === 'PGRST116') {
      // 設定が存在しない場合は作成
      const { data: newSettings, error } = await supabase
        .from('api_settings')
        .insert(validatedData)
        .select()
        .single()

      if (error) {
        throw error
      }
      settings = newSettings
    } else if (existingSettings) {
      // 設定が存在する場合は更新
      const { data: updatedSettings, error } = await supabase
        .from('api_settings')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('workspace_id', validatedData.workspace_id)
        .select()
        .single()

      if (error) {
        throw error
      }
      settings = updatedSettings
    } else {
      throw existingError
    }

    // レスポンスではAPIキーをマスクする
    const maskedSettings = {
      ...settings,
      gemini_api_key: settings.gemini_api_key ? '********' : null,
      notion_api_token: settings.notion_api_token ? '********' : null
    }

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error('Save API settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// API設定削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // ユーザーがワークスペースのメンバーかどうかを確認
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 管理者権限の確認
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // API設定を削除
    const { error } = await supabase
      .from('api_settings')
      .delete()
      .eq('workspace_id', workspaceId)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'API settings deleted successfully' })
  } catch (error) {
    console.error('Delete API settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

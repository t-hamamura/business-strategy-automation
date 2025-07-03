import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getCurrentUser } from '@/lib/supabase'
import { z } from 'zod'

// プロンプトテンプレート作成用のスキーマ
const createPromptTemplateSchema = z.object({
  workspace_id: z.string().uuid('有効なワークスペースIDが必要です'),
  order_index: z.number().int().min(0),
  phase: z.string().min(1, 'フェーズは必須です'),
  title: z.string().min(1, 'タイトルは必須です'),
  main_question: z.string().min(1, 'メイン質問は必須です'),
  overview: z.string().min(1, '概要は必須です'),
  deliverables: z.string().min(1, '成果物は必須です'),
  tags: z.array(z.string()),
  prompt_content: z.object({
    phase1: z.object({
      title: z.string(),
      content: z.string()
    }),
    phase2: z.object({
      title: z.string(),
      content: z.string()
    }),
    phase3: z.object({
      title: z.string(),
      content: z.string()
    })
  }),
  variables: z.array(z.string()),
  is_active: z.boolean().default(true),
  is_custom: z.boolean().default(true)
})

// プロンプトテンプレート更新用のスキーマ
const updatePromptTemplateSchema = z.object({
  order_index: z.number().int().min(0).optional(),
  phase: z.string().min(1, 'フェーズは必須です').optional(),
  title: z.string().min(1, 'タイトルは必須です').optional(),
  main_question: z.string().min(1, 'メイン質問は必須です').optional(),
  overview: z.string().min(1, '概要は必須です').optional(),
  deliverables: z.string().min(1, '成果物は必須です').optional(),
  tags: z.array(z.string()).optional(),
  prompt_content: z.object({
    phase1: z.object({
      title: z.string(),
      content: z.string()
    }),
    phase2: z.object({
      title: z.string(),
      content: z.string()
    }),
    phase3: z.object({
      title: z.string(),
      content: z.string()
    })
  }).optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
})

// プロンプトテンプレート一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    const isActive = searchParams.get('is_active')
    
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

    // プロンプトテンプレート一覧を取得
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('order_index', { ascending: true })

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: templates, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Get prompt templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// プロンプトテンプレート作成
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPromptTemplateSchema.parse(body)

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

    // プロンプトテンプレートを作成
    const { data: template, error } = await supabase
      .from('prompt_templates')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create prompt template error:', error)
    
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

// プロンプトテンプレート更新
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const validatedData = updatePromptTemplateSchema.parse(updateData)

    const supabase = createServerSupabase()

    // プロンプトテンプレートが存在し、ユーザーがアクセス権を持っているかを確認
    const { data: template, error: templateError } = await supabase
      .from('prompt_templates')
      .select(`
        *,
        workspace_members!inner (
          user_id,
          role
        )
      `)
      .eq('id', id)
      .eq('workspace_members.user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 })
    }

    // プロンプトテンプレートを更新
    const { data: updatedTemplate, error } = await supabase
      .from('prompt_templates')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Update prompt template error:', error)
    
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

// プロンプトテンプレート削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // プロンプトテンプレートが存在し、ユーザーがアクセス権を持っているかを確認
    const { data: template, error: templateError } = await supabase
      .from('prompt_templates')
      .select(`
        *,
        workspace_members!inner (
          user_id,
          role
        )
      `)
      .eq('id', id)
      .eq('workspace_members.user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 })
    }

    // カスタムテンプレートのみ削除可能
    if (!template.is_custom) {
      return NextResponse.json({ error: 'Cannot delete default template' }, { status: 400 })
    }

    // プロンプトテンプレートを削除（実際には非アクティブ化）
    const { error } = await supabase
      .from('prompt_templates')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Template deactivated successfully' })
  } catch (error) {
    console.error('Delete prompt template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

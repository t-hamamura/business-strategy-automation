import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getCurrentUser } from '@/lib/supabase-server'
import { z } from 'zod'

// プロジェクト作成用のスキーマ
const createProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  description: z.string().optional(),
  company_name: z.string().min(1, '企業名は必須です'),
  industry: z.string().min(1, '業界は必須です'),
  target_market: z.string().optional(),
  main_product_service: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  budget_range: z.string().optional(),
  workspace_id: z.string().uuid('有効なワークスペースIDが必要です')
})

// プロジェクト更新用のスキーマ
const updateProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').optional(),
  description: z.string().optional(),
  company_name: z.string().min(1, '企業名は必須です').optional(),
  industry: z.string().min(1, '業界は必須です').optional(),
  target_market: z.string().optional(),
  main_product_service: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  budget_range: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional()
})

// プロジェクト一覧取得
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

    // プロジェクト一覧を取得
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// プロジェクト作成
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

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

    // プロジェクトを作成
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    
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

// プロジェクト更新
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const validatedData = updateProjectSchema.parse(updateData)

    const supabase = createServerSupabase()

    // プロジェクトが存在し、ユーザーがアクセス権を持っているかを確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
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

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // プロジェクトを更新
    const { data: updatedProject, error } = await supabase
      .from('projects')
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

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error('Update project error:', error)
    
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

// プロジェクト削除
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // プロジェクトが存在し、ユーザーがアクセス権を持っているかを確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
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

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // プロジェクトを削除（実際にはアーカイブ）
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Project archived successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { apiUsageTracker } from '@/lib/api-usage-tracker'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspace_id')
    const days = parseInt(searchParams.get('days') || '30')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // 使用量統計を取得
    const usageStats = await apiUsageTracker.getUserUsageStats(
      user.id,
      workspaceId,
      days
    )

    // クォータ情報を取得
    const quotas = await apiUsageTracker.getUserQuotas(user.id, workspaceId)

    return NextResponse.json({
      usageStats,
      quotas,
      summary: {
        totalRequests: usageStats.reduce((sum, stat) => sum + stat.total_requests, 0),
        totalTokens: usageStats.reduce((sum, stat) => sum + (stat.total_tokens || 0), 0),
        totalCost: usageStats.reduce((sum, stat) => sum + (stat.total_cost || 0), 0),
        avgResponseTime: usageStats.length > 0 
          ? usageStats.reduce((sum, stat) => sum + (stat.avg_response_time || 0), 0) / usageStats.length 
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching API usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
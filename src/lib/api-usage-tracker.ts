import { createServerSupabase } from './supabase-server'

export interface ApiUsageLog {
  user_id: string
  workspace_id: string
  service_id: string
  endpoint: string
  method: string
  status_code?: number
  response_time_ms?: number
  request_size_bytes?: number
  response_size_bytes?: number
  tokens_used?: number
  cost_usd?: number
  error_message?: string
  metadata?: Record<string, any>
}

export interface ApiQuota {
  id: string
  user_id: string
  workspace_id: string
  service_id: string
  quota_type: 'daily' | 'monthly' | 'yearly'
  limit_value: number
  used_value: number
  reset_date: string
  created_at: string
  updated_at: string
}

export class ApiUsageTracker {
  private supabase = createServerSupabase()

  /**
   * API使用量を記録
   */
  async logApiUsage(log: ApiUsageLog): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_usage_logs')
        .insert(log)

      if (error) {
        console.error('Failed to log API usage:', error)
      }
    } catch (error) {
      console.error('Error logging API usage:', error)
    }
  }

  /**
   * API使用量制限をチェック
   */
  async checkQuota(
    userId: string,
    workspaceId: string,
    serviceId: string,
    quotaType: 'daily' | 'monthly' | 'yearly' = 'daily'
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_api_quota', {
          p_user_id: userId,
          p_workspace_id: workspaceId,
          p_service_id: serviceId,
          p_quota_type: quotaType
        })

      if (error) {
        console.error('Failed to check API quota:', error)
        return true // エラーの場合は制限なしとして扱う
      }

      return data || true
    } catch (error) {
      console.error('Error checking API quota:', error)
      return true
    }
  }

  /**
   * API使用量を更新
   */
  async updateUsage(
    userId: string,
    workspaceId: string,
    serviceId: string,
    usageValue: number = 1
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('update_api_usage', {
          p_user_id: userId,
          p_workspace_id: workspaceId,
          p_service_id: serviceId,
          p_usage_value: usageValue
        })

      if (error) {
        console.error('Failed to update API usage:', error)
      }
    } catch (error) {
      console.error('Error updating API usage:', error)
    }
  }

  /**
   * ユーザーのAPI使用量統計を取得
   */
  async getUserUsageStats(
    userId: string,
    workspaceId: string,
    days: number = 30
  ) {
    try {
      const { data, error } = await this.supabase
        .from('api_usage_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .gte('usage_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('usage_date', { ascending: false })

      if (error) {
        console.error('Failed to get usage stats:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting usage stats:', error)
      return []
    }
  }

  /**
   * ユーザーのクォータ情報を取得
   */
  async getUserQuotas(userId: string, workspaceId: string) {
    try {
      const { data, error } = await this.supabase
        .from('api_quotas')
        .select(`
          *,
          api_services (
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)

      if (error) {
        console.error('Failed to get user quotas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting user quotas:', error)
      return []
    }
  }

  /**
   * サービスIDを名前から取得
   */
  async getServiceIdByName(serviceName: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('api_services')
        .select('id')
        .eq('name', serviceName)
        .single()

      if (error) {
        console.error('Failed to get service ID:', error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('Error getting service ID:', error)
      return null
    }
  }
}

// シングルトンインスタンス
export const apiUsageTracker = new ApiUsageTracker() 
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ApiUsageStats {
  user_id: string
  workspace_id: string
  service_id: string
  service_name: string
  usage_date: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  avg_response_time: number
  total_tokens: number
  total_cost: number
  last_request_at: string
}

interface ApiQuota {
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
  api_services: {
    name: string
    description: string
  }
}

interface ApiUsageSummary {
  totalRequests: number
  totalTokens: number
  totalCost: number
  avgResponseTime: number
}

interface ApiUsageDashboardProps {
  workspaceId: string
}

export function ApiUsageDashboard({ workspaceId }: ApiUsageDashboardProps) {
  const [usageStats, setUsageStats] = useState<ApiUsageStats[]>([])
  const [quotas, setQuotas] = useState<ApiQuota[]>([])
  const [summary, setSummary] = useState<ApiUsageSummary>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    avgResponseTime: 0
  })
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [isLoading, setIsLoading] = useState(true)

  const fetchApiUsage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/api-usage?workspace_id=${workspaceId}&days=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data.usageStats || [])
        setQuotas(data.quotas || [])
        setSummary(data.summary || {
          totalRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch API usage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiUsage()
  }, [workspaceId, selectedPeriod])

  // クォータ使用率を計算
  const getQuotaUsagePercentage = (quota: ApiQuota) => {
    return Math.min((quota.used_value / quota.limit_value) * 100, 100)
  }

  // クォータの警告レベルを取得
  const getQuotaWarningLevel = (quota: ApiQuota) => {
    const percentage = getQuotaUsagePercentage(quota)
    if (percentage >= 90) return 'critical'
    if (percentage >= 75) return 'warning'
    return 'normal'
  }

  // サービス別の統計を計算
  const serviceStats = usageStats.reduce((acc, stat) => {
    if (!acc[stat.service_name]) {
      acc[stat.service_name] = {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        avgResponseTime: 0,
        requestCount: 0
      }
    }
    
    acc[stat.service_name].totalRequests += stat.total_requests
    acc[stat.service_name].totalTokens += stat.total_tokens || 0
    acc[stat.service_name].totalCost += stat.total_cost || 0
    acc[stat.service_name].avgResponseTime += stat.avg_response_time || 0
    acc[stat.service_name].requestCount += 1
    
    return acc
  }, {} as Record<string, any>)

  // 平均値を計算
  Object.keys(serviceStats).forEach(service => {
    if (serviceStats[service].requestCount > 0) {
      serviceStats[service].avgResponseTime /= serviceStats[service].requestCount
    }
  })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API使用量</h2>
          <p className="text-muted-foreground">
            APIサービスの使用状況と制限を確認できます
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">過去7日</SelectItem>
              <SelectItem value="30">過去30日</SelectItem>
              <SelectItem value="90">過去90日</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchApiUsage} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総リクエスト数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              期間中の総API呼び出し数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総トークン数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              AI APIで使用したトークン数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総コスト</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              API使用にかかった費用
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均応答時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(summary.avgResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              APIの平均応答時間
            </p>
          </CardContent>
        </Card>
      </div>

      {/* クォータ情報 */}
      <Card>
        <CardHeader>
          <CardTitle>使用量制限</CardTitle>
          <CardDescription>
            各APIサービスの使用量制限と現在の使用状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotas.filter(q => q.quota_type === 'daily').map((quota) => {
              const percentage = getQuotaUsagePercentage(quota)
              const warningLevel = getQuotaWarningLevel(quota)
              
              return (
                <div key={quota.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{quota.api_services.name}</span>
                      <Badge variant={warningLevel === 'critical' ? 'destructive' : warningLevel === 'warning' ? 'secondary' : 'default'}>
                        {quota.quota_type}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {quota.used_value.toLocaleString()} / {quota.limit_value.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>リセット日: {formatDate(quota.reset_date)}</span>
                    <span>{percentage.toFixed(1)}% 使用中</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* サービス別統計 */}
      <Card>
        <CardHeader>
          <CardTitle>サービス別統計</CardTitle>
          <CardDescription>
            各APIサービスの詳細な使用統計
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>サービス</TableHead>
                <TableHead>リクエスト数</TableHead>
                <TableHead>トークン数</TableHead>
                <TableHead>コスト</TableHead>
                <TableHead>平均応答時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(serviceStats).map(([serviceName, stats]) => (
                <TableRow key={serviceName}>
                  <TableCell className="font-medium">{serviceName}</TableCell>
                  <TableCell>{stats.totalRequests.toLocaleString()}</TableCell>
                  <TableCell>{stats.totalTokens.toLocaleString()}</TableCell>
                  <TableCell>${stats.totalCost.toFixed(4)}</TableCell>
                  <TableCell>{Math.round(stats.avgResponseTime)}ms</TableCell>
                </TableRow>
              ))}
              {Object.keys(serviceStats).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    データがありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 日別使用量グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>日別使用量</CardTitle>
          <CardDescription>
            期間中の日別API使用量の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageStats.slice(0, 10).map((stat) => (
              <div key={`${stat.service_id}-${stat.usage_date}`} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{stat.service_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(stat.usage_date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{stat.total_requests} リクエスト</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.total_tokens?.toLocaleString() || 0} トークン
                  </div>
                </div>
              </div>
            ))}
            {usageStats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                使用量データがありません
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
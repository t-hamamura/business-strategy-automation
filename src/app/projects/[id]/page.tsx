import { notFound } from 'next/navigation'
import { getCurrentUser, createServerSupabase } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  Calendar, 
  Users, 
  Target, 
  DollarSign,
  PlayCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import ProjectActions from '@/components/project-actions'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    notFound()
  }

  const supabase = createServerSupabase()

  // プロジェクト詳細を取得
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      workspaces (
        name,
        slug
      )
    `)
    .eq('id', params.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // 実行ログを取得
  const { data: executionLogs, error: logsError } = await supabase
    .from('execution_logs')
    .select(`
      *,
      prompt_templates (
        title,
        phase,
        order_index
      )
    `)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const logs = logsError ? [] : executionLogs || []

  // 統計情報を計算
  const totalLogs = logs.length
  const completedLogs = logs.filter(log => log.status === 'completed').length
  const failedLogs = logs.filter(log => log.status === 'failed').length
  const progressPercentage = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0

  // 最新の実行ログ
  const recentLogs = logs.slice(0, 5)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.company_name} • {project.industry}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
          <ProjectActions project={project} />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進捗率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了項目</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLogs}</div>
            <p className="text-xs text-muted-foreground">
              / {totalLogs} 項目
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失敗項目</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedLogs}</div>
            <p className="text-xs text-muted-foreground">
              要再実行
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最終更新</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {formatDate(project.updated_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="execution">実行履歴</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  プロジェクト情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">プロジェクト説明</h4>
                  <p className="text-sm text-muted-foreground">
                    {project.description || '説明がありません'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">企業情報</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">企業名:</span> {project.company_name}</div>
                    <div><span className="font-medium">業界:</span> {project.industry}</div>
                    {project.target_market && (
                      <div><span className="font-medium">ターゲット市場:</span> {project.target_market}</div>
                    )}
                    {project.main_product_service && (
                      <div><span className="font-medium">主要製品・サービス:</span> {project.main_product_service}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  競合・予算情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.competitors && project.competitors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">競合企業</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.competitors.map((competitor: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {competitor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {project.budget_range && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">予算規模</h4>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.budget_range}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-2">作成日時</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(project.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>実行履歴</CardTitle>
              <CardDescription>
                最新の実行結果を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">まだ実行履歴がありません</p>
                  <p className="text-sm text-muted-foreground">
                    「実行開始」ボタンから戦略調査を開始してください
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {log.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {log.status === 'failed' && (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          {log.status === 'running' && (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                          {log.status === 'pending' && (
                            <Clock className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.prompt_templates?.title || 'Unknown Template'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phase {log.phase} • {formatDate(log.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                        {log.notion_page_id && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プロジェクト設定</CardTitle>
              <CardDescription>
                プロジェクトの設定を変更できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                設定画面は開発中です...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

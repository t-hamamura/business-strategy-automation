'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  PlayCircle, 
  PauseCircle, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react'
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils'

interface ExecutionDashboardProps {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (project: Project | null) => void
}

interface ExecutionLog {
  id: string
  project_id: string
  prompt_template_id: string
  phase: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  output_data: any
  notion_page_id: string | null
  error_message: string | null
  execution_time_ms: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  prompt_templates?: {
    title: string
    phase: string
    order_index: number
  }
}

export function ExecutionDashboard({ 
  projects, 
  selectedProject, 
  onSelectProject 
}: ExecutionDashboardProps) {
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  // 実行ログを取得
  const fetchExecutionLogs = async (projectId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/execution-logs?project_id=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setExecutionLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch execution logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 選択されたプロジェクトが変更されたときに実行ログを取得
  useEffect(() => {
    if (selectedProject) {
      fetchExecutionLogs(selectedProject.id)
    } else {
      setExecutionLogs([])
    }
  }, [selectedProject])

  // 実行開始
  const handleStartExecution = async () => {
    if (!selectedProject) return

    setIsExecuting(true)
    try {
      const response = await fetch('/api/execute/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          promptTemplateIds: [], // 全てのテンプレートを実行
          executionSettings: {
            executionDelay: 30,
            skipOnError: true,
            notionIntegration: true
          }
        }),
      })

      if (response.ok) {
        // 実行開始後、ログを再取得
        await fetchExecutionLogs(selectedProject.id)
      }
    } catch (error) {
      console.error('Failed to start execution:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  // 統計情報を計算
  const stats = selectedProject ? {
    total: executionLogs.length,
    completed: executionLogs.filter(log => log.status === 'completed').length,
    failed: executionLogs.filter(log => log.status === 'failed').length,
    running: executionLogs.filter(log => log.status === 'running').length,
    pending: executionLogs.filter(log => log.status === 'pending').length
  } : {
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    pending: 0
  }

  const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* プロジェクト選択 */}
      <Card>
        <CardHeader>
          <CardTitle>実行管理</CardTitle>
          <CardDescription>
            プロジェクトを選択して実行状況を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select
                value={selectedProject?.id || ''}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === value)
                  onSelectProject(project || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="プロジェクトを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProject && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleStartExecution}
                  disabled={isExecuting || stats.running > 0}
                >
                  {isExecuting || stats.running > 0 ? (
                    <>
                      <PauseCircle className="mr-2 h-4 w-4" />
                      実行中
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      実行開始
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedProject && fetchExecutionLogs(selectedProject.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  更新
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* 実行統計 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">進捗</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                <Progress value={progressPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">完了</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  / {stats.total}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">実行中</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.running}</div>
                <p className="text-xs text-muted-foreground">
                  項目
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">失敗</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  要再実行
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待機中</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  項目
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 実行ログ */}
          <Card>
            <CardHeader>
              <CardTitle>実行ログ</CardTitle>
              <CardDescription>
                {selectedProject.name} の実行履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : executionLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">実行ログがありません</p>
                  <p className="text-sm text-muted-foreground">
                    「実行開始」ボタンから調査を開始してください
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>項目</TableHead>
                      <TableHead>フェーズ</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>実行時間</TableHead>
                      <TableHead>開始時刻</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executionLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="font-medium">
                            {log.prompt_templates?.title || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          Phase {log.phase}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            {getStatusLabel(log.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.execution_time_ms ? (
                            `${(log.execution_time_ms / 1000).toFixed(1)}s`
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {log.started_at ? (
                            formatRelativeTime(log.started_at)
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.notion_page_id && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            {log.status === 'failed' && (
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

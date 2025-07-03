'use client'

import { useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { Project, PromptTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Play, Settings, FileText, Users, TrendingUp } from 'lucide-react'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { ProjectCard } from '@/components/project-card'
import { ExecutionDashboard } from '@/components/execution-dashboard'
import { PromptTemplateList } from '@/components/prompt-template-list'

interface DashboardClientProps {
  user: User
  workspace: any
  projects: Project[]
  promptTemplates: PromptTemplate[]
}

export function DashboardClient({ 
  user, 
  workspace, 
  projects, 
  promptTemplates 
}: DashboardClientProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // プロジェクトの統計情報を計算
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length
  }

  // プロンプトテンプレートの統計情報
  const templateStats = {
    total: promptTemplates.length,
    active: promptTemplates.filter(t => t.is_active).length,
    custom: promptTemplates.filter(t => t.is_custom).length,
    byPhase: promptTemplates.reduce((acc, template) => {
      acc[template.phase] = (acc[template.phase] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
          <p className="text-muted-foreground">
            {workspace.workspaces.name} での事業戦略自動化システム
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規プロジェクト
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総プロジェクト数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">
              アクティブ: {projectStats.active}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了プロジェクト</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              完了率: {projectStats.total > 0 ? Math.round((projectStats.completed / projectStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">調査項目</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateStats.active}</div>
            <p className="text-xs text-muted-foreground">
              カスタム: {templateStats.custom}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">チームメンバー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              役割: {workspace.role}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          <TabsTrigger value="execution">実行管理</TabsTrigger>
          <TabsTrigger value="templates">調査項目</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onSelect={setSelectedProject}
              />
            ))}
            {projects.length === 0 && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>プロジェクトがありません</CardTitle>
                  <CardDescription>
                    新しいプロジェクトを作成して、事業戦略の調査を開始しましょう。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsCreateProjectOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    最初のプロジェクトを作成
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <ExecutionDashboard 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <PromptTemplateList 
            templates={promptTemplates}
            workspaceId={workspace.workspace_id}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API設定</CardTitle>
              <CardDescription>
                Gemini AIとNotionの連携設定を行います。
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

      {/* プロジェクト作成ダイアログ */}
      <CreateProjectDialog
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        workspaceId={workspace.workspace_id}
      />
    </div>
  )
}
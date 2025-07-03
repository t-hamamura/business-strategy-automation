import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, getCurrentWorkspace, getProjects, getPromptTemplates } from '@/lib/supabase-server'
import { DashboardClient } from './dashboard-client'
import { LoadingDashboard } from '@/components/loading-dashboard'

// 動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const workspace = await getCurrentWorkspace(user.id)
  
  if (!workspace) {
    redirect('/onboarding')
  }

  const [projects, promptTemplates] = await Promise.all([
    getProjects(workspace.workspace_id),
    getPromptTemplates(workspace.workspace_id)
  ])

  return (
    <Suspense fallback={<LoadingDashboard />}>
      <DashboardClient 
        user={user}
        workspace={workspace}
        projects={projects}
        promptTemplates={promptTemplates}
      />
    </Suspense>
  )
}

export const metadata = {
  title: 'ダッシュボード | Business Strategy Automation',
  description: '事業戦略自動化システムのダッシュボード',
}
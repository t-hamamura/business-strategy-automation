'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Building, 
  Calendar, 
  Target, 
  Play,
  MoreHorizontal,
  Edit,
  Archive,
  Eye
} from 'lucide-react'
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  onSelect?: (project: Project) => void
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExecute = async () => {
    setIsLoading(true)
    // TODO: 実行開始のロジック
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleArchive = async () => {
    // TODO: アーカイブのロジック
    console.log('Archive project:', project.id)
  }

  const handleEdit = () => {
    // TODO: 編集のロジック
    console.log('Edit project:', project.id)
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {project.description || '説明がありません'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusLabel(project.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect?.(project)}>
                  <Eye className="mr-2 h-4 w-4" />
                  詳細表示
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  アーカイブ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 企業情報 */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{project.company_name}</span>
            <span>•</span>
            <span>{project.industry}</span>
          </div>

          {/* ターゲット市場 */}
          {project.target_market && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="truncate">{project.target_market}</span>
            </div>
          )}

          {/* 競合企業 */}
          {project.competitors && project.competitors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.competitors.slice(0, 3).map((competitor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {competitor}
                </Badge>
              ))}
              {project.competitors.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.competitors.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 作成日時 */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatRelativeTime(project.created_at)}</span>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-2 pt-2">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                詳細を見る
              </Button>
            </Link>
            <Button
              onClick={handleExecute}
              disabled={isLoading || project.status === 'running'}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

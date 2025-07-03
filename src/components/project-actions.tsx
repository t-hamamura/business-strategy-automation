"use client"

import { useState } from "react"
import { Button } from '@/components/ui/button'
import { PlayCircle, Edit, Archive, Eye } from 'lucide-react'
import { Project } from '@/types/database'

interface ProjectActionsProps {
  project: Project
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExecute = async () => {
    setIsLoading(true)
    // TODO: 実行開始のロジック
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleEdit = () => {
    // TODO: 編集のロジック
    alert('編集機能は開発中です')
  }

  const handleArchive = () => {
    // TODO: アーカイブのロジック
    alert('アーカイブ機能は開発中です')
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleExecute} disabled={isLoading || project.status === 'active'}>
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <PlayCircle className="mr-2 h-4 w-4" />
        )}
        実行開始
      </Button>
      <Button onClick={handleEdit} variant="outline">
        <Edit className="mr-2 h-4 w-4" />
        編集
      </Button>
      <Button onClick={handleArchive} variant="outline">
        <Archive className="mr-2 h-4 w-4" />
        アーカイブ
      </Button>
      <Button variant="outline">
        <Eye className="mr-2 h-4 w-4" />
        詳細表示
      </Button>
    </div>
  )
} 
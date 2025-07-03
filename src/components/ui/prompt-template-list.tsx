'use client'

import { useState, useEffect } from 'react'
import { PromptTemplate } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Tag,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PromptTemplateListProps {
  templates: PromptTemplate[]
  workspaceId: string
}

export function PromptTemplateList({ templates, workspaceId }: PromptTemplateListProps) {
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>(templates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // フィルタリング
  useEffect(() => {
    let filtered = templates

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // フェーズフィルター
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(template => template.phase === selectedPhase)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedPhase])

  // フェーズ一覧を取得
  const phases = Array.from(new Set(templates.map(t => t.phase))).sort()

  // テンプレートを複製
  const handleDuplicate = async (template: PromptTemplate) => {
    try {
      const response = await fetch('/api/prompt-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...template,
          id: undefined, // 新しいIDが生成される
          title: `${template.title} (コピー)`,
          workspace_id: workspaceId,
          is_custom: true,
          order_index: templates.length + 1
        }),
      })

      if (response.ok) {
        // 成功時の処理（リフレッシュなど）
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  // テンプレートを削除
  const handleDelete = async (templateId: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return

    try {
      const response = await fetch(`/api/prompt-templates?id=${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 成功時の処理（リフレッシュなど）
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  // テンプレートの詳細を表示
  const handleView = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">調査項目テンプレート</h2>
          <p className="text-muted-foreground">
            戦略調査で使用するプロンプトテンプレートを管理します
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規テンプレート
        </Button>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="タイトル、概要、タグで検索..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">フェーズ:</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">すべて</option>
                {phases.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テンプレート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>テンプレート一覧</CardTitle>
          <CardDescription>
            {filteredTemplates.length} 件のテンプレート
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedPhase !== 'all' 
                  ? '検索条件に一致するテンプレートがありません' 
                  : 'テンプレートがありません'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>フェーズ</TableHead>
                  <TableHead>タグ</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>更新日</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {template.overview}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.phase}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {template.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {template.is_active ? 'アクティブ' : '非アクティブ'}
                        </span>
                        {template.is_custom && (
                          <Badge variant="outline" className="text-xs">
                            カスタム
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(template.updated_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(template)}>
                              <Eye className="mr-2 h-4 w-4" />
                              詳細表示
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="mr-2 h-4 w-4" />
                              複製
                            </DropdownMenuItem>
                            {template.is_custom && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 詳細表示ダイアログ */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.phase} • {selectedTemplate?.overview}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">メイン質問</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.main_question}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">成果物</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.deliverables}
                  </p>
                </div>
              </div>

              {/* タグ */}
              <div>
                <h4 className="font-semibold mb-2">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 変数 */}
              <div>
                <h4 className="font-semibold mb-2">使用変数</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable, index) => (
                    <Badge key={index} variant="outline">
                      [{variable}]
                    </Badge>
                  ))}
                </div>
              </div>

              {/* プロンプト内容 */}
              <div>
                <h4 className="font-semibold mb-2">プロンプト内容</h4>
                <div className="space-y-4">
                  {Object.entries(selectedTemplate.prompt_content as any).map(([phase, content]: [string, any]) => (
                    <Card key={phase}>
                      <CardHeader>
                        <CardTitle className="text-lg">{content.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {content.content}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

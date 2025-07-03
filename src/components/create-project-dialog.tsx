'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientSupabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

const projectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(100, 'プロジェクト名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  company_name: z.string().min(1, '企業名は必須です').max(100, '企業名は100文字以内で入力してください'),
  industry: z.string().min(1, '業界は必須です'),
  target_market: z.string().max(200, 'ターゲット市場は200文字以内で入力してください').optional(),
  main_product_service: z.string().max(200, '主要製品・サービスは200文字以内で入力してください').optional(),
  budget_range: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
}

const industryOptions = [
  'テクノロジー・IT',
  '製造業',
  '小売・流通',
  '金融・保険',
  '医療・ヘルスケア',
  '教育',
  '不動産',
  '建設',
  '運輸・物流',
  'エネルギー',
  '食品・飲料',
  'ファッション・アパレル',
  'メディア・エンターテイメント',
  'コンサルティング',
  'その他'
]

const budgetOptions = [
  '〜100万円',
  '100万円〜500万円',
  '500万円〜1000万円',
  '1000万円〜5000万円',
  '5000万円〜1億円',
  '1億円以上',
  '未定'
]

export function CreateProjectDialog({ isOpen, onClose, workspaceId }: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorInput, setCompetitorInput] = useState('')
  const router = useRouter()
  const supabase = createClientSupabase()

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      company_name: '',
      industry: '',
      target_market: '',
      main_product_service: '',
      budget_range: '',
    },
  })

  const addCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {
      setCompetitors([...competitors, competitorInput.trim()])
      setCompetitorInput('')
    }
  }

  const removeCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor))
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...data,
          workspace_id: workspaceId,
          competitors: competitors.length > 0 ? competitors : null,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "プロジェクトを作成しました",
        description: `${data.name} の調査プロジェクトが正常に作成されました。`,
      })

      onClose()
      router.refresh()
      
      // プロジェクト詳細ページに遷移
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "エラーが発生しました",
        description: "プロジェクトの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      setCompetitors([])
      setCompetitorInput('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規プロジェクト作成</DialogTitle>
          <DialogDescription>
            事業戦略調査プロジェクトの基本情報を入力してください。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>プロジェクト名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 新事業戦略策定プロジェクト" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>プロジェクト説明</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="このプロジェクトの目的や背景を記述してください"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>企業名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 株式会社サンプル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>業界 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="業界を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_market"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ターゲット市場</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 国内BtoB市場、20-30代女性など" {...field} />
                  </FormControl>
                  <FormDescription>
                    主なターゲットとなる市場や顧客層を記述してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="main_product_service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主要製品・サービス</FormLabel>
                  <FormControl>
                    <Input placeholder="例: SaaSプラットフォーム、ECサイト、コンサルティングサービス" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>競合企業</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="競合企業名を入力"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                />
                <Button type="button" variant="outline" onClick={addCompetitor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {competitors.map((competitor) => (
                    <Badge key={competitor} variant="secondary" className="pr-0">
                      {competitor}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1"
                        onClick={() => removeCompetitor(competitor)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="budget_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>予算規模</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="予算規模を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetOptions.map((budget) => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '作成中...' : 'プロジェクト作成'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
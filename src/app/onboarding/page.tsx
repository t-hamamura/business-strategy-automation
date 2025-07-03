'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart3, Building, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

const onboardingSchema = z.object({
  workspaceName: z.string().min(2, 'ワークスペース名は2文字以上で入力してください'),
  workspaceSlug: z.string()
    .min(2, 'スラッグは2文字以上で入力してください')
    .regex(/^[a-zA-Z0-9-_]+$/, 'スラッグは英数字、ハイフン、アンダースコアのみ使用できます'),
  companyName: z.string().min(1, '会社名は必須です'),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const router = useRouter()
  const supabase = createClientSupabase()

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: '',
      workspaceSlug: '',
      companyName: '',
    },
  })

  const watchWorkspaceName = form.watch('workspaceName')

  // ワークスペース名からスラッグを自動生成
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // ワークスペース名が変更されたときにスラッグを自動更新
  React.useEffect(() => {
    if (watchWorkspaceName) {
      const slug = generateSlug(watchWorkspaceName)
      form.setValue('workspaceSlug', slug)
    }
  }, [watchWorkspaceName, form])

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('認証エラー：ログインしてください')
      }

      // 1. ワークスペースを作成
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: data.workspaceName,
          slug: data.workspaceSlug,
          description: `${data.companyName}の事業戦略自動化ワークスペース`,
          owner_id: user.id,
        })
        .select()
        .single()

      if (workspaceError) {
        if (workspaceError.code === '23505') {
          throw new Error('このスラッグは既に使用されています。別のスラッグを試してください。')
        }
        throw workspaceError
      }

      // 2. ワークスペースメンバーとして追加
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })

      if (memberError) {
        throw memberError
      }

      // 3. 初期プロンプトテンプレートを作成
      const { error: promptError } = await supabase
        .from('prompt_templates')
        .update({ workspace_id: workspace.id })
        .eq('workspace_id', '00000000-0000-0000-0000-000000000000')

      if (promptError) {
        console.warn('初期プロンプトテンプレートの作成に失敗しました:', promptError)
      }

      toast({
        title: "ワークスペースを作成しました",
        description: `${data.workspaceName}の準備が完了しました。`,
      })

      // ダッシュボードにリダイレクト
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setError(error.message || 'ワークスペースの作成に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ようこそ！
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              事業戦略自動化システムにようこそ。まず、ワークスペースを設定しましょう。
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                ワークスペース設定
              </CardTitle>
              <CardDescription>
                チームで使用するワークスペースを作成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>アカウント作成完了</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-primary">
                  <Users className="h-4 w-4" />
                  <span>ワークスペース設定 ←現在ここ</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>ダッシュボード</span>
                </div>
              </div>
              <div className="mt-6">
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  始める
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Building className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ワークスペース作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            チームで使用するワークスペースの情報を入力してください
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ワークスペース情報</CardTitle>
            <CardDescription>
              後から変更することも可能です
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ワークスペース名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 株式会社サンプル"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workspaceSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>スラッグ（URL識別子）</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: sample-company"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会社名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 株式会社サンプル"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    戻る
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? '作成中...' : 'ワークスペース作成'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

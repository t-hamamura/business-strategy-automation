import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, Bot, FileText, Zap, Users, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Gemini AI Powered
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            事業戦略を
            <span className="text-primary"> 自動化</span>
            <br />
            する時代へ
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            マッキンゼー品質のコンサルティングフレームワークをベースに、
            Gemini AIが38項目の戦略調査を自動実行。
            Notionに整理して保存します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-3">
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                ログイン
              </Button>
            </Link>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">38</div>
              <div className="text-sm text-muted-foreground">項目の戦略調査</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">フェーズの段階実行</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">自動化された分析</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              なぜ選ばれるのか
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              従来の手作業による戦略策定から、AI自動化による高速・高品質な分析へ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>包括的な戦略分析</CardTitle>
                <CardDescription>
                  マッキンゼーフレームワークベースの38項目調査
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    内部環境・自社アセット評価
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    市場分析・競合インテリジェンス
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    顧客セグメンテーション
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>完全自動化</CardTitle>
                <CardDescription>
                  設定後は全て自動で実行・レポート生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gemini AIによる高品質分析
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Notion自動整理・保存
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    進捗リアルタイム確認
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>チーム対応</CardTitle>
                <CardDescription>
                  ワークスペース機能でチーム全体で利用可能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    複数プロジェクト同時管理
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    カスタムプロンプト対応
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    履歴・バージョン管理
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* フェーズ説明セクション */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              5フェーズの戦略策定プロセス
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              体系的なアプローチで、抜け漏れのない戦略を策定
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                phase: 'Ⅰ',
                title: '現状把握と事業基盤',
                items: '6項目',
                description: '内部環境分析、ビジネスモデル診断、市場分析など',
                color: 'bg-blue-500'
              },
              {
                phase: 'Ⅱ',
                title: '顧客理解と戦略の核',
                items: '5項目',
                description: '顧客セグメンテーション、カスタマージャーニー、ブランド戦略など',
                color: 'bg-green-500'
              },
              {
                phase: 'Ⅲ',
                title: '市場参入と成長戦略',
                items: '6項目',
                description: 'Go-to-Market戦略、パートナーシップ、グローバル展開など',
                color: 'bg-purple-500'
              },
              {
                phase: 'Ⅳ',
                title: 'マーケティング・コミュニケーション',
                items: '11項目',
                description: 'コンテンツ戦略、SNS運用、広告プランニングなど',
                color: 'bg-orange-500'
              },
              {
                phase: 'Ⅴ',
                title: '事業推進基盤とリスク管理',
                items: '9項目',
                description: 'KPI設計、組織変革、ESG戦略、リスク管理など',
                color: 'bg-red-500'
              }
            ].map((phase, index) => (
              <div key={index} className="flex items-center space-x-8">
                <div className={`${phase.color} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl`}>
                  {phase.phase}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-xl font-semibold">{phase.title}</h3>
                    <Badge variant="outline">{phase.items}</Badge>
                  </div>
                  <p className="text-muted-foreground">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            今すぐ戦略策定を始めませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            無料でアカウントを作成して、AI自動化による事業戦略策定を体験してください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                無料でアカウント作成
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                既にアカウントをお持ちの方
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

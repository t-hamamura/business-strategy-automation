import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingDashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-16" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

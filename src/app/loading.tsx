import { BarChart3 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
        <div className="text-2xl font-bold text-primary">
          Business Strategy Automation
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  )
}

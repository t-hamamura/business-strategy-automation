"use client";

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">404 - ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページは存在しないか、移動した可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Button>
            </Link>
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              前のページに戻る
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              問題が続く場合は、
              <Link href="/contact" className="text-primary hover:underline">
                お問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

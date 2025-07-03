"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Loader2, Database, Info } from 'lucide-react'

export default function NotionSettings() {
  const [token, setToken] = useState('')
  const [dbId, setDbId] = useState('')
  const [status, setStatus] = useState<'idle'|'testing'|'success'|'error'>('idle')
  const [testResult, setTestResult] = useState<string>('')
  const [dbCreateStatus, setDbCreateStatus] = useState<'idle'|'creating'|'success'|'error'>('idle')
  const [dbCreateResult, setDbCreateResult] = useState<string>('')

  // Notion接続テスト
  const handleTestConnection = async () => {
    setStatus('testing')
    setTestResult('')
    try {
      const res = await fetch('/api/notion/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setTestResult('接続成功: ' + data.message)
      } else {
        setStatus('error')
        setTestResult('接続失敗: ' + (data.error || '不明なエラー'))
      }
    } catch (e) {
      setStatus('error')
      setTestResult('接続失敗: ネットワークエラー')
    }
  }

  // Notion DB自動作成
  const handleCreateDatabase = async () => {
    setDbCreateStatus('creating')
    setDbCreateResult('')
    try {
      const res = await fetch('/api/notion/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (res.ok) {
        setDbCreateStatus('success')
        setDbId(data.databaseId)
        setDbCreateResult('データベース作成成功: ' + data.databaseId)
      } else {
        setDbCreateStatus('error')
        setDbCreateResult('作成失敗: ' + (data.error || '不明なエラー'))
      }
    } catch (e) {
      setDbCreateStatus('error')
      setDbCreateResult('作成失敗: ネットワークエラー')
    }
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>
          <Database className="inline-block mr-2" />Notion連携設定
        </CardTitle>
        <CardDescription>
          Notion APIトークンを入力し、接続テストやデータベース自動作成を行えます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* トークン入力 */}
        <div>
          <label className="block mb-1 font-medium">Notion APIトークン</label>
          <Input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="secret_xxx..."
            autoComplete="off"
          />
        </div>
        {/* 接続テスト */}
        <div className="flex items-center space-x-2">
          <Button onClick={handleTestConnection} disabled={!token || status==='testing'}>
            {status==='testing' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            接続テスト
          </Button>
          {status==='success' && <span className="text-green-600">OK</span>}
          {status==='error' && <span className="text-red-600">NG</span>}
        </div>
        {testResult && (
          <Alert variant={status==='success' ? 'default' : 'destructive'}>
            {status==='success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{status==='success' ? '接続成功' : '接続失敗'}</AlertTitle>
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}
        {/* DB自動作成 */}
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateDatabase} disabled={!token || dbCreateStatus==='creating'} variant="secondary">
            {dbCreateStatus==='creating' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            データベース自動作成
          </Button>
          {dbCreateStatus==='success' && <span className="text-green-600">作成済</span>}
          {dbCreateStatus==='error' && <span className="text-red-600">失敗</span>}
        </div>
        {dbCreateResult && (
          <Alert variant={dbCreateStatus==='success' ? 'default' : 'destructive'}>
            {dbCreateStatus==='success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{dbCreateStatus==='success' ? '作成成功' : '作成失敗'}</AlertTitle>
            <AlertDescription>{dbCreateResult}</AlertDescription>
          </Alert>
        )}
        {/* 設定状況 */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span>現在の設定状況:</span>
            {dbId ? (
              <span className="text-green-700 font-mono">{dbId}</span>
            ) : (
              <span className="text-gray-500">未設定</span>
            )}
          </div>
        </div>
        {/* 設定ガイド */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md border text-sm">
          <b>Notion連携ガイド</b>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Notionの「インテグレーション」を作成し、シークレットトークンを取得</li>
            <li>上記トークンを入力し「接続テスト」</li>
            <li>「データベース自動作成」でレポート用DBを作成</li>
            <li>Notion側でワークスペース/ページにインテグレーションを招待</li>
            <li>作成されたDBのIDを控えておく</li>
          </ol>
          <div className="mt-2 text-xs text-gray-500">※トークンやDB情報は安全に管理してください</div>
        </div>
      </CardContent>
    </Card>
  )
} 
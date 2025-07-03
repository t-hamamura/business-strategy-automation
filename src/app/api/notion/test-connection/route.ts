import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'トークンが未入力です' }, { status: 400 })
    }
    // Notionユーザー情報取得でトークン有効性を確認
    const userRes = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      },
    })
    const userData = await userRes.json()
    if (!userRes.ok) {
      return NextResponse.json({ error: userData.message || 'トークンが無効です' }, { status: 401 })
    }
    // DB作成権限テスト（実際には作成せず、権限エラーのみ検出）
    const dbTestRes = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: 'dummy' },
        title: [{ type: 'text', text: { content: 'Test DB' } }],
        properties: { Name: { title: {} } },
      }),
    })
    // 403なら権限なし、400なら親ページID不正（トークン自体はOK）
    if (dbTestRes.status === 403) {
      return NextResponse.json({ error: 'データベース作成権限がありません' }, { status: 403 })
    }
    // 400は想定通り（親ページID不正）
    const ms = Date.now() - start
    return NextResponse.json({
      message: `トークン有効。接続速度: ${ms}ms`,
      user: userData,
      dbCreate: dbTestRes.status === 400 ? 'OK' : 'NG',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '不明なエラー' }, { status: 500 })
  }
} 
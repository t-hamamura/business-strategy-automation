import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token, parentPageId } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'トークンが未入力です' }, { status: 400 })
    }
    // 親ページIDがなければユーザーのワークスペーストップを取得
    let parentId = parentPageId
    if (!parentId) {
      // Notion APIでユーザーのワークスペース取得（最初のページ）
      const searchRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 1, filter: { property: 'object', value: 'page' } })
      })
      const searchData = await searchRes.json()
      if (!searchRes.ok || !searchData.results?.[0]?.id) {
        return NextResponse.json({ error: '親ページIDが取得できませんでした。Notionでページを作成し、IDを指定してください。' }, { status: 400 })
      }
      parentId = searchData.results[0].id
    }
    // データベース作成
    const dbRes = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: parentId },
        title: [{ type: 'text', text: { content: '戦略レポート' } }],
        properties: {
          Name: { title: {} },
          フェーズ: { select: { options: [ { name: '1', color: 'blue' }, { name: '2', color: 'green' }, { name: '3', color: 'yellow' } ] } },
          ステータス: { select: { options: [ { name: '未着手', color: 'gray' }, { name: '進行中', color: 'blue' }, { name: '完了', color: 'green' } ] } },
          作成日: { date: {} },
        },
      })
    })
    const dbData = await dbRes.json()
    if (!dbRes.ok) {
      return NextResponse.json({ error: dbData.message || 'データベース作成に失敗しました' }, { status: 500 })
    }
    // テンプレートページ作成（省略可: 必要なら追加実装）
    // ...
    return NextResponse.json({ databaseId: dbData.id, url: dbData.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '不明なエラー' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getCurrentUser } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ExecuteRequest {
  projectId: string
  promptTemplateId: string
  phase: number
  previousOutput?: string
}

// プロンプト内の変数を置換するヘルパー関数
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `[${key}]`
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
  })
  
  return result
}

// Gemini AIでプロンプトを実行
async function executeWithGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`Gemini API実行エラー: ${error.message}`)
  }
}

// Notionページを作成
async function createNotionPage(content: string, title: string, notionToken: string, databaseId: string): Promise<string | null> {
  if (!notionToken || !databaseId) {
    return null
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          'Name': {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content.slice(0, 2000) // Notion APIの制限に対応
                  }
                }
              ]
            }
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`)
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error('Notion API error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ExecuteRequest = await request.json()
    const { projectId, promptTemplateId, phase, previousOutput } = body

    const supabase = createServerSupabase()

    // プロジェクト情報を取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, workspaces!inner(*)')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // プロンプトテンプレートを取得
    const { data: template, error: templateError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', promptTemplateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // API設定を取得
    const { data: apiSettings, error: apiError } = await supabase
      .from('api_settings')
      .select('*')
      .eq('workspace_id', project.workspace_id)
      .single()

    if (apiError || !apiSettings?.gemini_api_key) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 400 })
    }

    // 実行ログを作成
    const { data: executionLog, error: logError } = await supabase
      .from('execution_logs')
      .insert({
        project_id: projectId,
        prompt_template_id: promptTemplateId,
        phase,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) {
      throw new Error('Failed to create execution log')
    }

    try {
      // プロンプトコンテンツを取得
      const promptContent = template.prompt_content as any
      const phaseKey = `phase${phase}`
      
      if (!promptContent[phaseKey]) {
        throw new Error(`Phase ${phase} not found in template`)
      }

      let prompt = promptContent[phaseKey].content

      // 変数を置換
      const variables = {
        '自社名': project.company_name,
        '業界': project.industry,
        '主要製品/サービス': project.main_product_service || '',
        'ターゲット市場': project.target_market || '',
        '競合企業': project.competitors?.join(', ') || '',
        '予算規模': project.budget_range || ''
      }

      prompt = replaceVariables(prompt, variables)

      // フェーズ2以降の場合、前の出力を含める
      if (phase > 1 && previousOutput) {
        const contextSection = prompt.match(/### ▼▼▼.*?### ▲▲▲/s)
        if (contextSection) {
          prompt = prompt.replace(contextSection[0], 
            `### ▼▼▼ 以下に、フェーズ${phase-1}で生成されたレポートをそのまま貼り付けてください ▼▼▼\n\n${previousOutput}\n\n### ▲▲▲ 貼り付けはここまで ▲▲▲`)
        }
      }

      // Gemini AIで実行
      const startTime = Date.now()
      const output = await executeWithGemini(prompt, apiSettings.gemini_api_key)
      const executionTime = Date.now() - startTime

      // Notionページを作成（オプション）
      let notionPageId = null
      if (apiSettings.notion_api_token && apiSettings.notion_database_id) {
        const pageTitle = `${project.name} - ${template.title} (Phase ${phase})`
        notionPageId = await createNotionPage(output, pageTitle, apiSettings.notion_api_token, apiSettings.notion_database_id)
      }

      // 実行ログを更新
      await supabase
        .from('execution_logs')
        .update({
          status: 'completed',
          output_data: { content: output },
          notion_page_id: notionPageId,
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionLog.id)

      return NextResponse.json({
        success: true,
        output,
        executionTime,
        notionPageId,
        logId: executionLog.id
      })

    } catch (error) {
      // エラー時のログ更新
      await supabase
        .from('execution_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', executionLog.id)

      throw error
    }

  } catch (error) {
    console.error('Execute API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
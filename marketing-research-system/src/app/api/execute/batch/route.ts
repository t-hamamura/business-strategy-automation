import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getCurrentUser } from '@/lib/supabase'

interface BatchExecuteRequest {
  projectId: string
  promptTemplateIds: string[]
  executionSettings: {
    executionDelay: number // 実行間隔（秒）
    skipOnError: boolean // エラー時にスキップするか
    notionIntegration: boolean // Notion連携を使用するか
  }
}

interface ExecutionResult {
  templateId: string
  phase: number
  success: boolean
  output?: string
  error?: string
  executionTime?: number
  notionPageId?: string
}

// 単一プロンプトの実行
async function executeSinglePrompt(
  projectId: string,
  templateId: string,
  phase: number,
  previousOutput?: string
): Promise<ExecutionResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        promptTemplateId: templateId,
        phase,
        previousOutput
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Execution failed')
    }

    const data = await response.json()
    return {
      templateId,
      phase,
      success: true,
      output: data.output,
      executionTime: data.executionTime,
      notionPageId: data.notionPageId
    }
  } catch (error) {
    return {
      templateId,
      phase,
      success: false,
      error: error.message
    }
  }
}

// 待機関数
function delay(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BatchExecuteRequest = await request.json()
    const { projectId, promptTemplateIds, executionSettings } = body

    const supabase = createServerSupabase()

    // プロジェクト情報を確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // プロンプトテンプレートを取得
    const { data: templates, error: templatesError } = await supabase
      .from('prompt_templates')
      .select('*')
      .in('id', promptTemplateIds)
      .eq('workspace_id', project.workspace_id)
      .order('order_index', { ascending: true })

    if (templatesError) {
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    const results: ExecutionResult[] = []
    const phaseOutputs: Record<string, Record<number, string>> = {} // templateId -> phase -> output

    // 各テンプレートを3フェーズずつ実行
    for (const template of templates) {
      phaseOutputs[template.id] = {}
      
      for (let phase = 1; phase <= 3; phase++) {
        try {
          // 前フェーズの出力を取得
          const previousOutput = phase > 1 ? phaseOutputs[template.id][phase - 1] : undefined

          console.log(`Executing ${template.title} - Phase ${phase}`)

          const result = await executeSinglePrompt(
            projectId,
            template.id,
            phase,
            previousOutput
          )

          results.push(result)

          if (result.success) {
            phaseOutputs[template.id][phase] = result.output!
            console.log(`✓ Completed ${template.title} - Phase ${phase}`)
          } else {
            console.error(`✗ Failed ${template.title} - Phase ${phase}: ${result.error}`)
            
            if (!executionSettings.skipOnError) {
              // エラー時に停止
              return NextResponse.json({
                success: false,
                error: `Execution failed at ${template.title} - Phase ${phase}: ${result.error}`,
                results
              }, { status: 500 })
            }
            // エラーをスキップして次に進む
            break
          }

          // 実行間隔を設ける（最後の実行でない場合）
          if (!(template === templates[templates.length - 1] && phase === 3)) {
            await delay(executionSettings.executionDelay)
          }

        } catch (error) {
          const errorResult: ExecutionResult = {
            templateId: template.id,
            phase,
            success: false,
            error: error.message
          }
          results.push(errorResult)

          if (!executionSettings.skipOnError) {
            return NextResponse.json({
              success: false,
              error: `Execution failed at ${template.title} - Phase ${phase}: ${error.message}`,
              results
            }, { status: 500 })
          }
          break
        }
      }
    }

    // プロジェクトステータスを更新
    await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    return NextResponse.json({
      success: true,
      message: 'Batch execution completed successfully',
      results,
      totalExecutions: results.length,
      successfulExecutions: results.filter(r => r.success).length,
      failedExecutions: results.filter(r => !r.success).length
    })

  } catch (error) {
    console.error('Batch execute API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          company_name: string
          industry: string
          target_market: string | null
          main_product_service: string | null
          competitors: string[] | null
          budget_range: string | null
          status: 'draft' | 'active' | 'completed' | 'archived'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          company_name: string
          industry: string
          target_market?: string | null
          main_product_service?: string | null
          competitors?: string[] | null
          budget_range?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          company_name?: string
          industry?: string
          target_market?: string | null
          main_product_service?: string | null
          competitors?: string[] | null
          budget_range?: string | null
          status?: 'draft' | 'active' | 'completed' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          workspace_id: string
          order_index: number
          phase: string
          title: string
          main_question: string
          overview: string
          deliverables: string
          tags: string[]
          prompt_content: Json
          variables: string[]
          is_active: boolean
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          order_index: number
          phase: string
          title: string
          main_question: string
          overview: string
          deliverables: string
          tags: string[]
          prompt_content: Json
          variables: string[]
          is_active?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          order_index?: number
          phase?: string
          title?: string
          main_question?: string
          overview?: string
          deliverables?: string
          tags?: string[]
          prompt_content?: Json
          variables?: string[]
          is_active?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_settings: {
        Row: {
          id: string
          workspace_id: string
          gemini_api_key: string | null
          notion_api_token: string | null
          notion_database_id: string | null
          api_rate_limit: number
          execution_delay: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          gemini_api_key?: string | null
          notion_api_token?: string | null
          notion_database_id?: string | null
          api_rate_limit?: number
          execution_delay?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          gemini_api_key?: string | null
          notion_api_token?: string | null
          notion_database_id?: string | null
          api_rate_limit?: number
          execution_delay?: number
          created_at?: string
          updated_at?: string
        }
      }
      execution_logs: {
        Row: {
          id: string
          project_id: string
          prompt_template_id: string | null
          phase: number
          status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
          input_data: Json | null
          output_data: Json | null
          notion_page_id: string | null
          error_message: string | null
          execution_time_ms: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          prompt_template_id?: string | null
          phase: number
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
          input_data?: Json | null
          output_data?: Json | null
          notion_page_id?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          prompt_template_id?: string | null
          phase?: number
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
          input_data?: Json | null
          output_data?: Json | null
          notion_page_id?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      member_role: 'owner' | 'admin' | 'member'
      execution_status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ヘルパー型
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// エンティティ型
export type Workspace = Tables<'workspaces'>
export type WorkspaceMember = Tables<'workspace_members'>
export type Project = Tables<'projects'>
export type PromptTemplate = Tables<'prompt_templates'>
export type ApiSettings = Tables<'api_settings'>
export type ExecutionLog = Tables<'execution_logs'>

// プロンプトコンテンツの型
export interface PromptContent {
  phase1: {
    title: string
    content: string
  }
  phase2: {
    title: string
    content: string
  }
  phase3: {
    title: string
    content: string
  }
}

// 実行設定の型
export interface ExecutionSettings {
  selectedPrompts: string[] // プロンプトテンプレートIDの配列
  executionDelay: number // 実行間隔（秒）
  skipOnError: boolean // エラー時にスキップするか
  notionIntegration: boolean // Notion連携を使用するか
}

// プロジェクト作成用の型
export interface CreateProjectData {
  name: string
  description?: string
  company_name: string
  industry: string
  target_market?: string
  main_product_service?: string
  competitors?: string[]
  budget_range?: string
}
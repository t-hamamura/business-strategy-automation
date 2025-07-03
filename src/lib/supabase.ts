// 後方互換性のため、両方のファイルからre-export
export { createClientSupabase } from './supabase-client'
export { 
  createServerSupabase, 
  createServiceSupabase,
  getCurrentUser,
  getCurrentWorkspace,
  getProjects,
  getPromptTemplates,
  getApiSettings,
  getExecutionLogs
} from './supabase-server'
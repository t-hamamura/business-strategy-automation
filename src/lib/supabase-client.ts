import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

// クライアントサイド用のみ
export const createClientSupabase = () => 
  createClientComponentClient<Database>() 
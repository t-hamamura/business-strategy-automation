'use client'

import { createClientSupabase } from '@/lib/supabase'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [supabaseClient] = useState(() => createClientSupabase())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={null}
    >
      {children}
      <Toaster />
    </SessionContextProvider>
  )
}

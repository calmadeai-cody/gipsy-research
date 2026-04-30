'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return <div suppressHydrationWarning>{children}</div>
}
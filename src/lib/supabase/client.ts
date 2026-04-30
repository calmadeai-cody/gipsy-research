import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // During build time or if env vars are placeholder, return a dummy client for SSR
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'placeholder' || 
      supabaseKey === 'placeholder' ||
      !supabaseUrl.startsWith('http')) {
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
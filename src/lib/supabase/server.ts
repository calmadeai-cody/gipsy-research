import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

let cachedClient: ReturnType<typeof createServerClient> | null = null

export async function createClient() {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // During build time or if env vars are placeholder, return a dummy client
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'placeholder' || 
      supabaseKey === 'placeholder' ||
      !supabaseUrl.startsWith('http')) {
    return createServerClient('https://placeholder.supabase.co', 'placeholder-key', {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    })
  }

  const cookieStore = await cookies()
  cachedClient = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Handle case where cookies can't be set in this context
        }
      },
    },
  })
  return cachedClient
}
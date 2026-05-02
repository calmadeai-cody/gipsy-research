// Auth helpers (server-side)
import { createClient } from './supabase/server'

// Types
interface ExtendedSession {
  user: {
    id: string
    email?: string
    name?: string
    image?: string
    tier?: string
    subscriptionStatus?: string
  }
}

// Helper to get current session
export async function getSession(): Promise<ExtendedSession | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .single()

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name,
      image: user.user_metadata?.avatar_url,
      tier: subscription?.tier || 'BASIC',
      subscriptionStatus: subscription?.status || 'inactive',
    },
  }
}

// Auth helper for API routes
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

// Sign in with email magic link
export async function signInWithEmail(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })
  return { error }
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })
  return { data, error }
}

// Sign out
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

// Update user profile
export async function updateProfile(updates: { name?: string; email?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  
  return { error }
}

// Middleware helper - check if user is authenticated
export function isAuthenticated(session: ExtendedSession | null): boolean {
  return session !== null && !!session.user
}

// Get subscription for current user
export async function getSubscription(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

// Update subscription
export async function updateSubscription(userId: string, updates: {
  tier?: string
  status?: string
  period?: string
  midtransOrderId?: string
  midtransTransactionId?: string
  currentPeriodEnd?: string
}) {
  const supabase = await createClient()
  
  // First check if subscription exists
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  } else {
    // Create new subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, ...updates })
      .select()
      .single()
    return { data, error }
  }
}
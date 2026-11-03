'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase-browser'

export type Profile = {
  id: string
  name: string
  phone: string
  mode: string
  quit_at: string
  best_seconds: number
  cigs_per_day: number
  pack_price: number
  cigs_per_pack: number
  why: string | null
  status: 'pending' | 'active' | 'inactive'
  notify_hours: number[]
  paid_count: number
  asaas_customer_id: string | null
  goal_idx: number | null
  ai_active: boolean
  ai_period_end: string | null
}

type Ctx = { profile: Profile; refresh: () => Promise<void> }
const ProfileCtx = createContext<Ctx | null>(null)

export const useProfile = () => {
  const c = useContext(ProfileCtx)
  if (!c) throw new Error('useProfile fora do provider')
  return c
}

export async function loadProfile(): Promise<Profile | null> {
  const { data: s } = await supabase.auth.getSession()
  if (!s.session) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', s.session.user.id).single()
  return (data as Profile) ?? null
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  const refresh = useCallback(async () => {
    const p = await loadProfile()
    if (!p) return router.replace('/')
    if (p.status !== 'active') return router.replace('/plano')
    setProfile(p)
  }, [router])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!profile)
    return (
      <div className="flex min-h-dvh items-center justify-center text-mute">Carregando sua trilha…</div>
    )
  return <ProfileCtx.Provider value={{ profile, refresh }}>{children}</ProfileCtx.Provider>
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

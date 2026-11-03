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
  // tenta algumas vezes: uma falha de rede não pode derrubar a pessoa para o login
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase.from('profiles').select('*').eq('id', s.session.user.id).maybeSingle()
    if (data) return data as Profile
    await new Promise(r => setTimeout(r, 600))
  }
  return null
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [failed, setFailed] = useState(false)

  const refresh = useCallback(async () => {
    const { data: s } = await supabase.auth.getSession()
    if (!s.session) return router.replace('/') // só aqui: realmente sem sessão
    const p = await loadProfile()
    if (!p) {
      // conta apagada no servidor? então a sessão guardada no aparelho não vale mais
      const { data: u, error } = await supabase.auth.getUser()
      if (error || !u.user) {
        await supabase.auth.signOut()
        return router.replace('/')
      }
      setFailed(true) // sessão válida, mas o perfil não carregou: mostra "tentar de novo"
      return
    }
    if (p.status !== 'active') return router.replace('/plano')
    setFailed(false)
    setProfile(p)
  }, [router])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!profile)
    return failed ? (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg">Não consegui carregar agora.</p>
        <button
          className="btn-gold max-w-xs"
          onClick={() => {
            setFailed(false)
            refresh()
          }}
        >
          Tentar de novo
        </button>
      </div>
    ) : (
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

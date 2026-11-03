'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { fmtDuration } from '@/lib/journey'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

// Oferta depois da primeira vitória. Só aparece na tela inicial:
// nunca no meio de uma ajuda (vontade) nem de uma missão.
export default function FirstWinOffer() {
  const { profile } = useProfile()
  const router = useRouter()
  const path = usePathname()
  const now = useNow(30000)
  const [show, setShow] = useState(false)
  const key = `offer-seen:${profile.id}`

  useEffect(() => {
    if (profile.status === 'active' || path !== '/app' || localStorage.getItem(key)) return
    let alive = true
    ;(async () => {
      const [{ count: m }, { count: c }] = await Promise.all([
        supabase.from('missions_done').select('id', { count: 'exact', head: true }),
        supabase.from('cravings').select('id', { count: 'exact', head: true }).eq('smoked', false),
      ])
      const firstHour = Date.now() - new Date(profile.quit_at).getTime() >= 3600 * 1000
      if (alive && ((m || 0) + (c || 0) >= 1 || firstHour)) setShow(true)
    })()
    return () => {
      alive = false
    }
  }, [path, profile.id, profile.status, profile.quit_at, key])

  if (!show) return null
  const left = profile.trial_ends_at ? (new Date(profile.trial_ends_at).getTime() - now) / 1000 : 0

  function dismiss(go: boolean) {
    localStorage.setItem(key, '1')
    setShow(false)
    if (go) router.push('/plano')
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-4 sm:items-center">
      <div className="panel w-full max-w-md space-y-4 bg-card p-6">
        <h2 className="font-serif text-3xl">Você já começou a sua jornada.</h2>
        <p className="text-lg text-sand/90">Continue avançando com o Pare de Fumar.</p>
        {left > 0 && <p className="text-mute">Seu teste grátis ainda tem {fmtDuration(left)}.</p>}
        <button className="btn-gold" onClick={() => dismiss(true)}>
          Continuar minha jornada
        </button>
        <button className="w-full py-2 text-mute" onClick={() => dismiss(false)}>
          Agora não
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Coins, Leaf, Mountain, Trophy } from 'lucide-react'
import { brl, fmtDuration, savings } from '@/lib/journey'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Progresso() {
  const { profile } = useProfile()
  const now = useNow(30000)
  const [total, setTotal] = useState(0)
  const [week, setWeek] = useState<{ key: string; label: string; n: number }[]>([])

  useEffect(() => {
    ;(async () => {
      const since = new Date()
      since.setDate(since.getDate() - 6)
      since.setHours(0, 0, 0, 0)
      const [{ count }, { data }] = await Promise.all([
        supabase.from('cravings').select('id', { count: 'exact', head: true }).eq('smoked', false),
        supabase.from('cravings').select('created_at').eq('smoked', false).gte('created_at', since.toISOString()),
      ])
      setTotal(count || 0)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(since)
        d.setDate(since.getDate() + i)
        return { key: d.toDateString(), label: DIAS[d.getDay()], n: 0 }
      })
      ;(data || []).forEach(c => {
        const k = new Date(c.created_at).toDateString()
        const day = days.find(x => x.key === k)
        if (day) day.n++
      })
      setWeek(days)
    })()
  }, [])

  const seconds = (now - new Date(profile.quit_at).getTime()) / 1000
  const days = Math.floor(seconds / 86400)
  const { cigs, money } = savings(seconds, profile.cigs_per_day, profile.pack_price, profile.cigs_per_pack)
  const max = Math.max(1, ...week.map(w => w.n))
  const beatRecord = seconds > profile.best_seconds && seconds > 3600

  return (
    <main className="space-y-4 px-5 safe-top">
      <div className="pt-3">
        <h1 className="font-serif text-4xl">Meu progresso</h1>
        <p className="text-mute">Você está indo muito bem.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="panel">
          <Leaf className="mb-2 text-leaf" size={28} />
          <p className="font-serif text-4xl">
            {days} <span className="text-lg text-mute">{days === 1 ? 'dia' : 'dias'}</span>
          </p>
          <p className="text-mute">sem fumar</p>
        </div>
        <div className="panel">
          <Coins className="mb-2 text-gold" size={28} />
          <p className="font-serif text-4xl">{brl(money).replace(/\s/g, ' ')}</p>
          <p className="text-mute">economizados</p>
        </div>
      </div>

      <div className="panel flex items-center gap-4">
        <Mountain className="text-leaf" size={36} />
        <div>
          <p className="font-serif text-4xl">{total}</p>
          <p className="text-mute">vontades superadas</p>
        </div>
        <p className="ml-auto text-right text-sm text-mute">{cigs} cigarros<br />evitados</p>
      </div>

      <div className="panel space-y-3">
        <p className="text-lg">Minha evolução · últimos 7 dias</p>
        <div className="flex h-36 items-end justify-between gap-2">
          {week.map(w => (
            <div key={w.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-mute">{w.n || ''}</span>
              <div
                className="w-full rounded-t-md bg-leaf/80"
                style={{ height: `${Math.max(4, (w.n / max) * 100)}px`, opacity: w.n ? 1 : 0.25 }}
              />
              <span className="text-xs text-mute">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel flex items-center gap-4 border-gold/40 bg-gold/10">
        <Trophy className="shrink-0 text-gold" size={36} />
        <div>
          <p className="text-lg">
            {beatRecord ? 'Você superou sua melhor marca' : 'Sua melhor marca'}
          </p>
          <p className="text-mute">
            {profile.best_seconds > 0 ? `${fmtDuration(Math.max(profile.best_seconds, beatRecord ? seconds : 0))} sem fumar` : 'Continue assim!'}
          </p>
        </div>
      </div>
    </main>
  )
}

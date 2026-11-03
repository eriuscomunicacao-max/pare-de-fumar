'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Coins, Lock, Mountain, RotateCcw, Trophy } from 'lucide-react'
import { NODES, brl, fmtDuration, iconFor, levelInfo, savings } from '@/lib/journey'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Progresso() {
  const { profile, refresh } = useProfile()
  const now = useNow(1000)
  const [total, setTotal] = useState(0)
  const [week, setWeek] = useState<{ key: string; label: string; n: number }[]>([])
  const [stage, setStage] = useState<'none' | 'confirm' | 'done'>('none')
  const [busy, setBusy] = useState(false)
  const [bestSaved, setBestSaved] = useState(0)

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
        const day = days.find(x => x.key === new Date(c.created_at).toDateString())
        if (day) day.n++
      })
      setWeek(days)
    })()
  }, [])

  const seconds = Math.max(0, (now - new Date(profile.quit_at).getTime()) / 1000)
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const { next, progress } = levelInfo(seconds)
  const remaining = next ? next.hours * 3600 - seconds : 0
  const { cigs, money } = savings(seconds, profile.cigs_per_day, profile.pack_price, profile.cigs_per_pack)
  const max = Math.max(1, ...week.map(w => w.n))
  const bestNow = Math.max(profile.best_seconds, seconds)
  const beatRecord = seconds > profile.best_seconds && seconds > 3600

  async function relapse() {
    setBusy(true)
    const cur = Math.floor((Date.now() - new Date(profile.quit_at).getTime()) / 1000)
    const best = Math.max(profile.best_seconds, cur)
    await supabase.from('cravings').insert({ user_id: profile.id, smoked: true })
    await supabase
      .from('profiles')
      .update({ quit_at: new Date().toISOString(), best_seconds: best })
      .eq('id', profile.id)
    await refresh()
    setBestSaved(best)
    setStage('done')
    setBusy(false)
  }

  const clock: [number, string][] = [
    [d, 'dias'],
    [h, 'horas'],
    [m, 'min'],
    [s, 'seg'],
  ]

  return (
    <main className="space-y-4 px-5 pb-4 safe-top">
      <div className="pt-3">
        <h1 className="font-serif text-4xl">Meu progresso</h1>
        <p className="text-mute">Você está indo muito bem.</p>
      </div>

      {/* contador ao vivo */}
      <section className="panel space-y-4 border-gold/30 text-center">
        <p className="text-mute">Livre do cigarro há</p>
        <div className="grid grid-cols-4 gap-2">
          {clock.map(([v, l]) => (
            <div key={l} className="rounded-xl bg-ink/60 py-3">
              <p className="font-serif text-4xl tabular-nums text-gold">{String(v).padStart(2, '0')}</p>
              <p className="text-xs text-mute">{l}</p>
            </div>
          ))}
        </div>
        {next ? (
          <div className="space-y-2">
            <div className="h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="text-sm text-mute">
              Faltam {fmtDuration(remaining)} para <b className="text-sand">{next.name}</b>
            </p>
          </div>
        ) : (
          <p className="text-leaf">Você completou toda a trilha.</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="panel">
          <Coins className="mb-2 text-gold" size={28} />
          <p className="font-serif text-3xl">{brl(money)}</p>
          <p className="text-mute">economizados</p>
        </div>
        <div className="panel">
          <Mountain className="mb-2 text-leaf" size={28} />
          <p className="font-serif text-3xl">{total}</p>
          <p className="text-mute">vontades superadas</p>
        </div>
      </div>
      <p className="text-center text-sm text-mute">{cigs} cigarros que você deixou de fumar</p>

      <div className="panel space-y-3">
        <p className="text-lg">Vontades superadas · últimos 7 dias</p>
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

      {/* conquistas */}
      <section className="panel space-y-3">
        <p className="text-lg">Suas conquistas</p>
        <div className="grid grid-cols-4 gap-3">
          {NODES.slice(1).map((n, k) => {
            const i = k + 1
            const got = seconds / 3600 >= n.hours
            const icon = iconFor(i)
            return (
              <div key={n.name} className="flex flex-col items-center gap-1 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  {icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={icon}
                      alt={n.name}
                      className="h-14 w-14 object-contain"
                      style={{ filter: got ? 'drop-shadow(0 0 6px rgba(232,195,106,.6))' : 'grayscale(1) opacity(.35)' }}
                    />
                  ) : (
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-serif ${got ? 'border-gold text-gold' : 'border-line text-mute'}`}>
                      {i}
                    </span>
                  )}
                  {!got && <Lock size={14} className="absolute bottom-0 right-0 text-mute" />}
                </div>
                <p className={`text-xs leading-tight ${got ? 'text-sand' : 'text-mute'}`}>{n.name}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="panel flex items-center gap-4 border-gold/40 bg-gold/10">
        <Trophy className="shrink-0 text-gold" size={36} />
        <div>
          <p className="text-lg">{beatRecord ? 'Você está batendo o seu recorde' : 'Seu recorde'}</p>
          <p className="text-mute">{bestNow > 60 ? `${fmtDuration(bestNow)} sem fumar` : 'Continue assim!'}</p>
        </div>
      </div>

      <button className="btn-ghost" onClick={() => setStage('confirm')}>
        <RotateCcw size={20} /> Falhei, quero recomeçar
      </button>

      {stage !== 'none' && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-4 sm:items-center">
          <div className="panel w-full max-w-md space-y-4 bg-card p-6">
            {stage === 'confirm' ? (
              <>
                <h2 className="font-serif text-3xl">Tudo bem. Acontece.</h2>
                <p className="text-lg text-sand/90">
                  Quer recomeçar a contagem agora? Suas conquistas e o seu recorde ficam guardados.
                </p>
                <button className="btn-gold" disabled={busy} onClick={relapse}>
                  {busy ? 'Recomeçando…' : 'Sim, recomeçar'}
                </button>
                <button className="w-full py-2 text-mute" onClick={() => setStage('none')}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <h2 className="font-serif text-3xl">Você não voltou ao ponto zero.</h2>
                <p className="text-xl text-sand">Voltou com experiência. Desta vez você vai conseguir.</p>
                <p className="text-mute">
                  {bestSaved > 60 ? `O seu recorde de ${fmtDuration(bestSaved)} continua com você. ` : ''}
                  Uma nova trilha começa agora, no seu ritmo.
                </p>
                <Link href="/app/missao/gatilho" className="btn-ghost">
                  Registrar o que aconteceu
                </Link>
                <button className="btn-gold" onClick={() => setStage('none')}>
                  Recomeçar com força
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

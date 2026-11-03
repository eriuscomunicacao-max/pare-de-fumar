'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, Check, ChevronRight, Settings, Wind } from 'lucide-react'
import Desert from '@/components/Desert'
import PrizesCard from '@/components/PrizesCard'
import { PERIOD_LABEL, periodOf, todayBR } from '@/lib/date'
import { fmtDuration, levelInfo } from '@/lib/journey'
import { getMission, missionsFor } from '@/lib/missions'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

// check-in: a resposta escolhe a missão do dia
const CHECKIN_TITLE = {
  manha: 'Como você está começando hoje?',
  tarde: 'Como está a sua tarde?',
  noite: 'Como foi o seu dia?',
}
const CHECKIN = [
  { key: 'confiante', label: 'Confiante', mission: '' }, // '' = a primeira missão do período
  { key: 'ansioso', label: 'Ansioso', mission: 'respiracao' },
  { key: 'cansado', label: 'Cansado', mission: 'agua' },
  { key: 'vontade', label: 'Com vontade', mission: 'gatilho' },
]

export default function Home() {
  const { profile } = useProfile()
  const router = useRouter()
  const now = useNow(30000)
  const [done, setDone] = useState<string[]>([])
  const [wins, setWins] = useState(0)
  const [mood, setMood] = useState<string | null>(null)
  const moodKey = `checkin:${profile.id}:${todayBR()}`

  useEffect(() => {
    setMood(localStorage.getItem(moodKey))
  }, [moodKey])

  useEffect(() => {
    supabase
      .from('missions_done')
      .select('mission_key')
      .eq('done_on', todayBR())
      .then(({ data }) => setDone((data || []).map(d => d.mission_key)))
    Promise.all([
      supabase.from('missions_done').select('id', { count: 'exact', head: true }),
      supabase.from('cravings').select('id', { count: 'exact', head: true }).eq('smoked', false),
    ]).then(([m, c]) => setWins((m.count || 0) + (c.count || 0)))
  }, [])

  function choose(c: (typeof CHECKIN)[number]) {
    localStorage.setItem(moodKey, c.key)
    setMood(c.key)
    if (c.key === 'vontade') router.push('/app/vontade')
  }

  const seconds = (now - new Date(profile.quit_at).getTime()) / 1000
  const { current, next, progress } = levelInfo(seconds)
  const days = Math.floor(seconds / 86400)
  const period = periodOf(now)
  const todays = missionsFor(period, now)
  const chosen = CHECKIN.find(c => c.key === mood)
  const mission = chosen ? (chosen.mission ? getMission(chosen.mission) : todays[0]) : undefined
  const trialLeft =
    profile.status !== 'active' && profile.trial_ends_at
      ? (new Date(profile.trial_ends_at).getTime() - now) / 1000
      : 0

  return (
    <main className="space-y-5 px-5 safe-top">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-serif text-4xl">Olá, {profile.name.split(' ')[0]}</h1>
          <p className="text-mute">Que bom ter você aqui hoje.</p>
        </div>
        <Link href="/app/ajustes" aria-label="Ajustes" className="rounded-full border border-line bg-card p-3">
          <Settings size={22} />
        </Link>
      </header>

      {/* check-in */}
      {!chosen ? (
        <section className="panel space-y-3">
          <h2 className="font-serif text-2xl">{CHECKIN_TITLE[period]}</h2>
          <div className="grid grid-cols-2 gap-2">
            {CHECKIN.map(c => (
              <button key={c.key} className="chip py-4 text-center" onClick={() => choose(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        mission && (
          <Link
            href={`/app/missao/${mission.key}`}
            className="panel block space-y-1 border-gold/40 bg-gold/10 active:scale-[0.99]"
          >
            <p className="text-sm text-gold">Sua missão de hoje · {chosen.label.toLowerCase()}</p>
            <p className="font-serif text-2xl leading-tight">{mission.title}</p>
            <p className="text-sm text-sand/90">{done.includes(mission.key) ? 'Concluída hoje' : 'Toque para começar'}</p>
          </Link>
        )
      )}

      {trialLeft > 0 && (
        <div className="panel flex items-center justify-between gap-3 border-gold/40 bg-gold/10">
          <span>
            <span className="block font-semibold text-gold">Teste grátis</span>
            <span className="text-sm text-sand/90">Faltam {fmtDuration(trialLeft)}</span>
          </span>
          {(wins > 0 || seconds >= 3600) && (
            <Link href="/plano" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink">
              Ver o plano
            </Link>
          )}
        </div>
      )}

      {/* primeira missão: 1 hora sem fumar */}
      {seconds < 3600 && (
        <section className="panel space-y-3 border-gold/40">
          <p className="text-sm text-gold">Sua primeira missão</p>
          <h2 className="font-serif text-3xl leading-tight">Ficar 1 hora sem fumar</h2>
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.round((seconds / 3600) * 100)}%` }} />
          </div>
          <p className="text-mute">
            Faltam {fmtDuration(3600 - seconds)}. Se a vontade aparecer, toque em “Estou com vontade agora”.
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-line bg-card">
        <Desert className="h-40 w-full" glow={0.8} />
        <div className="space-y-3 p-5">
          <h2 className="font-serif text-3xl">
            {current.name} · Dia {days + 1}
          </h2>
          <p className="text-mute">
            {next ? `Falta pouco para ${next.name}.` : 'Você chegou ao fim do mapa. Continue assim.'}
          </p>
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      </section>

      <Link href="/app/vontade" className="btn-gold animate-pulseRing text-xl">
        <Wind size={24} /> Estou com vontade agora
      </Link>

      <PrizesCard />

      <section className="space-y-3">
        <h2 className="font-serif text-2xl">Missões {PERIOD_LABEL[period]}</h2>
        {todays.map(m => (
          <Link
            key={m.key}
            href={`/app/missao/${m.key}`}
            className="panel flex items-center gap-3 active:scale-[0.99]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                done.includes(m.key) ? 'border-leaf bg-leaf/20 text-leaf' : 'border-line text-transparent'
              }`}
            >
              <Check size={18} />
            </span>
            <span className="flex-1 text-lg leading-snug">{m.title}</span>
            <ChevronRight className="text-mute" />
          </Link>
        ))}
      </section>

      {profile.status === 'active' &&
        (profile.ai_active ? (
          <Link href="/app/ia" className="btn-ghost">
            <Brain size={20} /> Companheiro IA
          </Link>
        ) : (
          <Link href="/app/ia" className="panel block space-y-2 border-gold/40 bg-gold/10 active:scale-[0.99]">
            <p className="flex items-center gap-2 font-serif text-2xl text-gold">
              <Brain size={24} /> Companheiro IA
            </p>
            <p className="text-sand/90">
              Apoio na hora da vontade, com base nos seus gatilhos. Fala só sobre parar de fumar.
            </p>
            <p className="text-lg font-semibold text-gold">R$ 59,90 por mês · Conhecer</p>
          </Link>
        ))}
    </main>
  )
}

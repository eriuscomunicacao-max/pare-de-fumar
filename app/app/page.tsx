'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, Check, ChevronRight, Settings, Wind } from 'lucide-react'
import Desert from '@/components/Desert'
import { todayBR } from '@/lib/date'
import { levelInfo } from '@/lib/journey'
import { MISSIONS } from '@/lib/missions'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

export default function Home() {
  const { profile } = useProfile()
  const now = useNow(30000)
  const [done, setDone] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('missions_done')
      .select('mission_key')
      .eq('done_on', todayBR())
      .then(({ data }) => setDone((data || []).map(d => d.mission_key)))
  }, [])

  const seconds = (now - new Date(profile.quit_at).getTime()) / 1000
  const { current, next, progress } = levelInfo(seconds)
  const days = Math.floor(seconds / 86400)
  const todays = MISSIONS.slice(0, 3)

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

      <section className="space-y-3">
        <h2 className="font-serif text-2xl">Missões de hoje</h2>
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

      {profile.ai_active ? (
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
      )}
    </main>
  )
}

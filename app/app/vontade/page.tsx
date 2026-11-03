'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase-browser'
import { useProfile } from '@/lib/profile-context'

const TRIGGERS = ['Ansiedade', 'Estresse', 'Café', 'Tédio', 'Bebida', 'Festa', 'Depois de comer', 'Outro']
const TIPS = ['Beba um copo de água devagar', 'Escove os dentes', 'Ande por dois minutos', 'Adie a decisão por 10 minutos']
const TOTAL = 180

type Step = 'start' | 'breathe' | 'after' | 'won' | 'slip'

export default function Vontade() {
  const router = useRouter()
  const { profile, refresh } = useProfile()
  const [step, setStep] = useState<Step>('start')
  const [intensity, setIntensity] = useState(0)
  const [trigger, setTrigger] = useState('')
  const [left, setLeft] = useState(TOTAL)
  const [helped, setHelped] = useState('Respiração')

  useEffect(() => {
    if (step !== 'breathe') return
    setLeft(TOTAL)
    const t = setInterval(() => setLeft(l => (l <= 1 ? (clearInterval(t), setStep('after'), 0) : l - 1)), 1000)
    return () => clearInterval(t)
  }, [step])

  async function save(smoked: boolean) {
    const { data: s } = await supabase.auth.getSession()
    const uid = s.session!.user.id
    await supabase.from('cravings').insert({
      user_id: uid,
      intensity: intensity || null,
      trigger: trigger || null,
      smoked,
      helped: smoked ? null : helped,
    })
    if (smoked) {
      const cur = Math.floor((Date.now() - new Date(profile.quit_at).getTime()) / 1000)
      await supabase
        .from('profiles')
        .update({ quit_at: new Date().toISOString(), best_seconds: Math.max(profile.best_seconds, cur) })
        .eq('id', uid)
      await refresh()
    }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const phase = left % 8 >= 4 ? 'Solte devagar' : 'Inspire fundo'

  return (
    <main className="px-5 pb-8 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>

      {step === 'start' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-4xl">Estou com vontade</h1>
            <p className="mt-1 text-lg text-mute">Tudo bem. Isso passa. Você consegue.</p>
          </div>
          <section className="space-y-3">
            <h2 className="text-xl">Como está a vontade?</h2>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setIntensity(n)}
                  className={`h-14 flex-1 rounded-full border text-xl ${
                    intensity === n ? 'border-gold bg-gold text-ink' : 'border-line bg-card'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-mute">
              <span>Leve</span>
              <span>Muito forte</span>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl">O que pode estar acontecendo?</h2>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map(t => (
                <button key={t} onClick={() => setTrigger(t)} className={`chip ${trigger === t ? 'chip-on' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </section>
          <button className="btn-gold" onClick={() => setStep('breathe')}>
            <Play size={20} /> Respirar por 3 min
          </button>
          <div className="panel space-y-2">
            <p className="text-mute">Ou tente uma destas:</p>
            {TIPS.map(t => (
              <p key={t} className="text-lg">• {t}</p>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setStep('after')}>
            Já fiz uma ação
          </button>
        </div>
      )}

      {step === 'breathe' && (
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-8 text-center">
          <p className="font-serif text-3xl">{phase}</p>
          <div className="flex h-60 w-60 items-center justify-center">
            <div className="h-56 w-56 animate-breathe rounded-full bg-gradient-to-b from-gold/80 to-orange-700/60 shadow-[0_0_80px_rgba(232,195,106,0.35)]" />
          </div>
          <p className="font-serif text-5xl tabular-nums">
            {mm}:{ss}
          </p>
          <button className="btn-ghost" onClick={() => setStep('after')}>
            Terminar agora
          </button>
        </div>
      )}

      {step === 'after' && (
        <div className="space-y-4 pt-4">
          <h1 className="font-serif text-4xl">E agora, como está?</h1>
          <button
            className="btn-gold"
            onClick={async () => {
              await save(false)
              setStep('won')
            }}
          >
            A vontade passou
          </button>
          <button
            className="btn-ghost"
            onClick={() => (profile.ai_active ? router.push('/app/ia') : setStep('breathe'))}
          >
            Ainda estou com vontade
          </button>
          <button
            className="w-full py-3 text-mute"
            onClick={async () => {
              await save(true)
              setStep('slip')
            }}
          >
            Acabei fumando
          </button>
        </div>
      )}

      {step === 'won' && (
        <div className="space-y-5 pt-8 text-center">
          <h1 className="font-serif text-4xl">Mais uma vontade superada</h1>
          <p className="text-lg text-mute">Cada vontade superada abre um novo caminho.</p>
          <div className="panel">
            <p className="text-sm text-mute">Recompensa</p>
            <p className="font-serif text-3xl text-gold">+1 conquista</p>
          </div>
          <Link href="/app" className="btn-gold">
            Voltar ao início
          </Link>
        </div>
      )}

      {step === 'slip' && (
        <div className="space-y-5 pt-8 text-center">
          <h1 className="font-serif text-4xl">Recomeçar com gentileza</h1>
          <p className="text-xl text-sand">Você não voltou ao ponto zero. Voltou com experiência.</p>
          <p className="text-mute">
            Suas conquistas e o seu recorde continuam com você. Escolha uma ação para os próximos 30 minutos.
          </p>
          <div className="panel space-y-2 text-left">
            {TIPS.map(t => (
              <p key={t} className="text-lg">• {t}</p>
            ))}
          </div>
          {profile.ai_active && (
            <Link href="/app/ia" className="btn-ghost">
              Conversar com o Companheiro
            </Link>
          )}
          <Link href="/app" className="btn-gold">
            Voltar ao início
          </Link>
        </div>
      )}
    </main>
  )
}

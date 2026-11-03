'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Coins, Heart, Target, Trophy, Wind } from 'lucide-react'
import Desert from '@/components/Desert'
import InstallGuide from '@/components/InstallGuide'
import { supabase } from '@/lib/supabase-browser'
import { hasAccess, loadProfile, Profile } from '@/lib/profile-context'

const STEPS = [
  {
    Icon: Wind,
    title: 'Bateu a vontade? Toque no botão.',
    text: 'Respiração guiada de 3 minutos e ações simples até ela passar.',
  },
  {
    Icon: Trophy,
    title: 'Cada vontade vencida vira conquista.',
    text: 'Acende uma luz no seu caminho e você ganha prêmios por isso.',
    bold: true,
  },
  {
    Icon: Heart,
    title: 'Escorregou? Sem culpa.',
    text: 'Você recomeça e mantém o seu recorde e as suas conquistas.',
  },
]

const EXTRAS = [
  { Icon: Bell, text: 'Lembretes na hora certa' },
  { Icon: Coins, text: 'Quanto você economiza' },
  { Icon: Target, text: 'Missões diárias de poucos minutos' },
]

export default function Welcome() {
  const router = useRouter()
  const [step, setStep] = useState<'checking' | 'welcome' | 'form'>('checking')
  const [name, setName] = useState('')
  const [cigs, setCigs] = useState('10')
  const [mode, setMode] = useState<'parar' | 'reduzir'>('parar')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [existing, setExisting] = useState<Profile | null>(null)

  useEffect(() => {
    loadProfile().then(p => {
      setExisting(p)
      setStep('welcome')
    })
  }, [])

  function start() {
    if (existing) router.push(hasAccess(existing) ? '/app' : '/plano')
    else setStep('form')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const r = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cigsPerDay: Number(cigs), mode }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      const { error } = await supabase.auth.signInWithPassword({ email: j.email, password: j.password })
      if (error) throw new Error('Não foi possível entrar. Tente de novo.')
      router.push('/app')
    } catch (e: any) {
      setErr(e.message || 'Algo deu errado.')
      setBusy(false)
    }
  }

  if (step === 'checking') return <div className="min-h-dvh" />

  if (step === 'form')
    return (
      <main className="relative flex min-h-dvh flex-col">
        <Desert className="absolute inset-0 h-full w-full" glow={0.9} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/20 to-ink" />
        <div className="relative z-10 flex flex-1 flex-col px-6 safe-top safe-bottom">
          <form onSubmit={submit} className="my-auto space-y-5 py-8">
            <h2 className="font-serif text-4xl text-sand">Vamos começar</h2>
            <label className="block space-y-1.5">
              <span className="text-sand/90">Como podemos te chamar?</span>
              <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Nome ou apelido" required />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sand/90">Quantos cigarros você fuma por dia?</span>
              <input className="field" inputMode="numeric" value={cigs} onChange={e => setCigs(e.target.value)} required />
            </label>
            <div className="space-y-1.5">
              <span className="text-sand/90">Qual é o seu objetivo?</span>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['parar', 'Parar agora'],
                    ['reduzir', 'Reduzir aos poucos'],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setMode(v)}
                    className={`chip py-4 text-center ${mode === v ? 'chip-on' : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
            <button className="btn-gold" disabled={busy}>
              {busy ? 'Preparando…' : 'Entrar na minha primeira missão'}
            </button>
            <button type="button" className="w-full py-2 text-mute" onClick={() => setStep('welcome')}>
              Voltar
            </button>
          </form>
        </div>
      </main>
    )

  return (
    <main className="relative min-h-dvh">
      <Desert className="absolute inset-x-0 top-0 h-80 w-full" glow={0.9} />
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-ink/30 via-ink/40 to-ink" />

      <div className="relative z-10 space-y-8 px-6 pb-56 pt-16 safe-top">
        <header className="space-y-3">
          <h1 className="font-serif text-5xl leading-[1.05] text-sand">Pare de fumar! Com esse Aplicativo.</h1>
          <p className="text-lg text-sand/85">
            A vontade de fumar dura poucos minutos. O app te ajuda a atravessar cada uma, sem julgamento.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-gold">Como funciona</h2>
                    {STEPS.map(({ Icon, title, text, bold }) => (
            <div key={title} className="panel flex items-start gap-4">
              <Icon className="mt-0.5 shrink-0 text-gold" size={28} strokeWidth={1.7} />
              <div>
                <p className="text-lg font-medium leading-snug">{title}</p>
                <p className={bold ? 'mt-1 font-bold text-sand' : 'mt-1 text-mute'}>{text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-3 text-center">
          {EXTRAS.map(({ Icon, text }) => (
            <div key={text} className="space-y-2">
              <Icon className="mx-auto text-gold" size={24} strokeWidth={1.7} />
              <p className="text-xs leading-snug text-sand/85">{text}</p>
            </div>
          ))}
        </section>

        <InstallGuide />

        <p className="text-center text-xs leading-relaxed text-mute">
          Não substitui acompanhamento médico. O SUS oferece tratamento gratuito contra o tabagismo.
        </p>
      </div>

      {/* botão sempre visível */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-md bg-gradient-to-t from-ink via-ink/95 to-transparent px-6 pb-[max(env(safe-area-inset-bottom),16px)] pt-10">
          <button className="btn-gold" onClick={start}>
            {existing ? 'Continuar minha jornada' : 'Começar minha primeira missão'}
          </button>
          {!existing && (
            <p className="mt-2 text-center text-sm text-sand/80">
              Grátis por 24 horas. Sem cartão.
              <span className="mt-0.5 block text-xs text-mute">Depois: R$ 9,90 no primeiro mês. Cancele quando quiser.</span>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

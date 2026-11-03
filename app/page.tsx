'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Desert from '@/components/Desert'
import InstallGuide from '@/components/InstallGuide'
import { supabase } from '@/lib/supabase-browser'
import { loadProfile, Profile } from '@/lib/profile-context'

export default function Welcome() {
  const router = useRouter()
  const [step, setStep] = useState<'checking' | 'welcome' | 'form'>('checking')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cigs, setCigs] = useState('10')
  const [price, setPrice] = useState('12')
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
    if (existing) router.push(existing.status === 'active' ? '/app' : '/plano')
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
        body: JSON.stringify({
          name,
          phone,
          cigsPerDay: Number(cigs),
          packPrice: Number(price.replace(',', '.')),
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      const { error } = await supabase.auth.signInWithPassword({ email: j.email, password: j.password })
      if (error) throw new Error('Não foi possível entrar. Tente de novo.')
      router.push('/plano')
    } catch (e: any) {
      setErr(e.message || 'Algo deu errado.')
      setBusy(false)
    }
  }

  if (step === 'checking') return <div className="min-h-dvh" />

  return (
    <main className="relative flex min-h-dvh flex-col">
      <Desert className="absolute inset-0 h-full w-full" glow={0.9} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/20 to-ink" />
      <div className="relative z-10 flex flex-1 flex-col px-6 safe-top safe-bottom">
        {step === 'welcome' ? (
          <>
            <div className="mt-14">
              <h1 className="font-serif text-6xl leading-[1.02] text-sand">
                Pare
                <br />
                de Fumar
              </h1>
              <p className="mt-5 font-serif text-2xl text-gold">Respire. Recomece.</p>
              <p className="mt-2 max-w-[17rem] text-lg text-sand/85">
                Cada vontade superada abre um novo caminho.
              </p>
            </div>
            <div className="mt-auto space-y-4 pb-6 pt-10">
              <InstallGuide />
              <button className="btn-gold" onClick={start}>
                Começar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="my-auto space-y-4 py-8">
            <h2 className="font-serif text-4xl text-sand">Vamos começar</h2>
            <p className="text-mute">Só precisamos de quatro informações.</p>
            <label className="block space-y-1.5">
              <span className="text-sand/90">Seu nome</span>
              <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Ana" required />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sand/90">Seu telefone (com DDD)</span>
              <input
                className="field"
                inputMode="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sand/90">Cigarros por dia</span>
                <input className="field" inputMode="numeric" value={cigs} onChange={e => setCigs(e.target.value)} required />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sand/90">Preço do maço (R$)</span>
                <input className="field" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} required />
              </label>
            </div>
            {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
            <button className="btn-gold" disabled={busy}>
              {busy ? 'Criando…' : 'Continuar'}
            </button>
            <button type="button" className="w-full py-2 text-mute" onClick={() => setStep('welcome')}>
              Voltar
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

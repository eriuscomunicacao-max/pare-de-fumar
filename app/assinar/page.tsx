'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'
import Desert from '@/components/Desert'
import PaymentForm from '@/components/PaymentForm'
import { supabase } from '@/lib/supabase-browser'
import { loadProfile, Profile } from '@/lib/profile-context'

export default function Assinar() {
  const router = useRouter()
  const [p, setP] = useState<Profile | null>(null)
  const [checking, setChecking] = useState(true)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadProfile().then(x => {
      if (x?.ai_active) return router.replace('/app')
      setP(x)
      setChecking(false)
    })
  }, [router])

  async function start(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const r = await fetch('/api/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      const { error } = await supabase.auth.signInWithPassword({ email: j.email, password: j.password })
      if (error) throw new Error('Não foi possível continuar. Tente de novo.')
      setP(await loadProfile())
    } catch (e: any) {
      setErr(e.message || 'Algo deu errado.')
    }
    setBusy(false)
  }

  if (checking) return <div className="min-h-dvh" />

  return (
    <main className="relative min-h-dvh">
      <Desert className="absolute inset-x-0 top-0 h-64 w-full" glow={0.9} />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-transparent to-ink" />
      <div className="relative z-10 space-y-6 px-6 pb-10 pt-28 safe-top">
        <header className="space-y-3 text-center">
          <Brain className="mx-auto text-gold" size={40} strokeWidth={1.5} />
          <h1 className="font-serif text-4xl leading-tight">Assine o seu app com IA para acompanhamento</h1>
          <p className="text-lg text-sand/85">
            O Companheiro IA fica com você na hora da vontade, com base nos seus gatilhos. Fala só sobre parar de
            fumar.
          </p>
          <p className="font-serif text-5xl text-gold">R$ 59,90</p>
          <p className="text-mute">por mês</p>
        </header>

        {!p ? (
          <form onSubmit={start} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sand/90">Como podemos te chamar?</span>
              <input
                className="field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome ou apelido"
                required
              />
            </label>
            {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
            <button className="btn-gold" disabled={busy}>
              {busy ? 'Preparando…' : 'Assinar agora'}
            </button>
          </form>
        ) : (
          <PaymentForm
            product="ai"
            price={59.9}
            hasCustomer={!!p.asaas_customer_id}
            needsPhone={!p.phone}
            isPaid={x => x.ai_active}
            onPaid={() => router.replace('/app')}
          />
        )}

        <p className="text-center text-xs leading-relaxed text-mute">
          Não substitui acompanhamento médico. Em crise, ligue 188 (CVV).
        </p>
      </div>
    </main>
  )
}

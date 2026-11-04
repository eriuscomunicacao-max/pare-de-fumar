'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Desert from '@/components/Desert'
import { supabase } from '@/lib/supabase-browser'
import { hasAccess, loadProfile } from '@/lib/profile-context'

export default function Acesso() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [cigs, setCigs] = useState('10')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadProfile().then(p => {
      if (p && hasAccess(p)) router.replace('/app')
      else setChecking(false)
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const r = await fetch('/api/acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cpf, cigsPerDay: Number(cigs) }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error)
      const { error } = await supabase.auth.signInWithPassword({ email: j.email, password: j.password })
      if (error) throw new Error('Não foi possível entrar. Tente de novo.')
      router.replace('/app')
    } catch (e: any) {
      setErr(e.message || 'Algo deu errado.')
      setBusy(false)
    }
  }

  if (checking) return <div className="min-h-dvh" />

  return (
    <main className="relative min-h-dvh">
      <Desert className="absolute inset-x-0 top-0 h-64 w-full" glow={0.9} />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-transparent to-ink" />
      <div className="relative z-10 space-y-5 px-6 pb-10 pt-28 safe-top">
        <header className="space-y-2">
          <h1 className="font-serif text-4xl leading-tight">Acesse o seu app</h1>
          <p className="text-lg text-sand/85">
            Use o e-mail e o CPF da compra do Método Pare de Fumar para entrar. Se já entrou antes, é o mesmo caminho
            para voltar.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sand/90">E-mail usado na compra</span>
            <input
              className="field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sand/90">CPF usado na compra</span>
            <input
              className="field"
              inputMode="numeric"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sand/90">Quantos cigarros você fuma por dia?</span>
            <input className="field" inputMode="numeric" value={cigs} onChange={e => setCigs(e.target.value)} />
          </label>
          {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
          <button className="btn-gold" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar no app'}
          </button>
        </form>

        <p className="text-center text-sm text-mute">
          Ainda não comprou?{' '}
          <Link href="/metodo" className="text-gold underline">
            Conheça o Método
          </Link>
        </p>
      </div>
    </main>
  )
}

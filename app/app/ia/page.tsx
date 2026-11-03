'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Brain, Leaf, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import PaymentForm from '@/components/PaymentForm'
import { apiPost } from '@/lib/api'
import { useProfile } from '@/lib/profile-context'

type Msg = { role: 'user' | 'assistant'; content: string }

const RAPIDAS = ['Estou ansioso', 'Estou entediado', 'Estou em uma festa', 'Quero uma ação rápida', 'Pensando em desistir']

export default function IA() {
  const { profile } = useProfile()
  return profile.ai_active ? <Chat /> : <Offer />
}

function Offer() {
  const { profile, refresh } = useProfile()
  return (
    <main className="space-y-5 px-5 pb-8 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>
      <div className="text-center">
        <Brain className="mx-auto mb-2 text-gold" size={40} strokeWidth={1.5} />
        <h1 className="font-serif text-4xl">Companheiro IA</h1>
        <p className="mt-1 text-lg text-mute">Apoio na hora da vontade, quando você precisar.</p>
      </div>
      <div className="panel space-y-3">
        <p className="flex gap-3"><MessageCircle className="shrink-0 text-gold" /> Conversa que entende o seu momento e os seus gatilhos.</p>
        <p className="flex gap-3"><ShieldCheck className="shrink-0 text-gold" /> Fala só sobre parar de fumar e sobre o app.</p>
        <p className="text-sm text-mute">Até 25 mensagens por dia. Não substitui médico ou psicólogo.</p>
      </div>
      <div className="text-center">
        <p className="font-serif text-5xl text-gold">R$ 59,90</p>
        <p className="text-mute">por mês, cancele quando quiser</p>
      </div>
      <PaymentForm
        product="ai"
        price={59.9}
        hasCustomer={!!profile.asaas_customer_id}
        isPaid={p => p.ai_active}
        onPaid={refresh}
      />
    </main>
  )
}

function Chat() {
  const { profile } = useProfile()
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `Olá, ${profile.name.split(' ')[0]}! Estou aqui com você. O que está sentindo agora?`,
    },
  ])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [remaining, setRemaining] = useState<number | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, busy])

  async function send(content: string) {
    const c = content.trim().slice(0, 300)
    if (!c || busy) return
    const next = [...msgs, { role: 'user' as const, content: c }]
    setMsgs(next)
    setText('')
    setErr('')
    setBusy(true)
    try {
      const r = await apiPost<{ reply: string; remaining: number }>('/api/ai', { messages: next.slice(1) })
      setMsgs([...next, { role: 'assistant', content: r.reply }])
      setRemaining(r.remaining)
    } catch (e: any) {
      setErr(e.message)
    }
    setBusy(false)
  }

  return (
    <main className="flex h-[calc(100dvh-6rem)] flex-col px-4 safe-top">
      <header className="flex items-center gap-3 py-3">
        <Link href="/app" aria-label="Voltar"><ArrowLeft /></Link>
        <h1 className="font-serif text-3xl">Companheiro</h1>
        {remaining !== null && <span className="ml-auto text-sm text-mute">{remaining} msgs hoje</span>}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf/20 text-leaf">
                <Leaf size={18} />
              </span>
            )}
            <p
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-lg leading-snug ${
                m.role === 'user' ? 'bg-gold text-ink' : 'bg-card text-sand'
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {busy && <p className="pl-10 text-mute">Escrevendo…</p>}
        {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
        <div ref={end} />
      </div>

      <div className="space-y-2 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RAPIDAS.map(r => (
            <button key={r} onClick={() => send(r)} className="chip shrink-0 text-base">{r}</button>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault()
            send(text)
          }}
          className="flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-4 pr-1.5"
        >
          <input
            className="min-w-0 flex-1 bg-transparent text-lg text-sand placeholder:text-mute focus:outline-none"
            value={text}
            maxLength={300}
            onChange={e => setText(e.target.value)}
            placeholder="Escreva uma mensagem…"
          />
          <button aria-label="Enviar" disabled={busy} className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
        <p className="text-center text-xs text-mute">Não substitui médico ou psicólogo. Em crise, ligue 188 (CVV).</p>
      </div>
    </main>
  )
}

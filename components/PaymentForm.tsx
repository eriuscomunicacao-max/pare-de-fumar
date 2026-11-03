'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, CreditCard, QrCode } from 'lucide-react'
import { apiPost } from '@/lib/api'
import { brl } from '@/lib/journey'
import { loadProfile, Profile } from '@/lib/profile-context'

type Props = {
  product: 'plan' | 'ai'
  price: number
  hasCustomer: boolean
  needsPhone?: boolean
  isPaid: (p: Profile) => boolean
  onPaid: () => void
}

export default function PaymentForm({ product, price, hasCustomer, needsPhone = false, isPaid, onPaid }: Props) {
  const [tab, setTab] = useState<'pix' | 'card'>('pix')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [pix, setPix] = useState<{ image: string; payload: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', exp: '', ccv: '' })
  const [holder, setHolder] = useState({ email: '', cep: '', number: '' })
  const [busy, setBusy] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [err, setErr] = useState('')
  const timer = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => () => clearInterval(timer.current), [])

  function poll() {
    setWaiting(true)
    clearInterval(timer.current)
    timer.current = setInterval(async () => {
      const p = await loadProfile()
      if (p && isPaid(p)) {
        clearInterval(timer.current)
        onPaid()
      }
    }, 3000)
  }

  async function generatePix() {
    setErr('')
    if (needsPhone && phone.replace(/\D/g, '').length < 10) return setErr('Informe o seu telefone com DDD.')
    setBusy(true)
    try {
      const r = await apiPost<{ image: string; payload: string }>('/api/pay', { product, method: 'pix', cpf, phone })
      setPix({ image: r.image, payload: r.payload })
      poll()
    } catch (e: any) {
      setErr(e.message)
    }
    setBusy(false)
  }

  async function payCard(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (needsPhone && phone.replace(/\D/g, '').length < 10) return setErr('Informe o seu telefone com DDD.')
    setBusy(true)
    const [month, year] = card.exp.split('/')
    try {
      await apiPost('/api/pay', {
        product,
        method: 'card',
        cpf,
        phone,
        card: { number: card.number, name: card.name, month, year, ccv: card.ccv },
        holder: { ...holder, cpf },
      })
      poll()
    } catch (e: any) {
      setErr(e.message)
    }
    setBusy(false)
  }

  const cpfField = (
    <label className="block space-y-1.5">
      <span className="text-sand/90">CPF (exigido para a cobrança)</span>
      <input className="field" inputMode="numeric" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
    </label>
  )

  if (waiting && !pix)
    return (
      <div className="panel space-y-2 text-center">
        <p className="text-lg">Confirmando o pagamento…</p>
        <p className="text-mute">Isso leva alguns segundos. Não feche o app.</p>
      </div>
    )

  return (
    <div className="space-y-4">
      {needsPhone && (
        <label className="block space-y-1.5">
          <span className="text-sand/90">Salve sua jornada e proteja seu progresso</span>
          <input className="field" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Seu telefone com DDD" />
        </label>
      )}
      <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-card p-1">
        {(['pix', 'card'] as const).map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setErr('')
            }}
            className={`flex items-center justify-center gap-2 rounded-full py-3 text-base ${
              tab === t ? 'bg-gold font-semibold text-ink' : 'text-mute'
            }`}
          >
            {t === 'pix' ? <QrCode size={18} /> : <CreditCard size={18} />}
            {t === 'pix' ? 'Pix' : 'Cartão'}
          </button>
        ))}
      </div>

      {tab === 'pix' && !pix && (
        <div className="space-y-3">
          {!hasCustomer && cpfField}
          {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
          <button className="btn-gold" disabled={busy} onClick={generatePix}>
            {busy ? 'Gerando Pix…' : `Pagar ${brl(price)} no Pix`}
          </button>
        </div>
      )}

      {tab === 'pix' && pix && (
        <div className="panel space-y-3 text-center">
          <p className="text-lg">Escaneie ou copie o código</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${pix.image}`}
            alt="QR Code do Pix"
            className="mx-auto h-56 w-56 rounded-xl bg-white p-2"
          />
          <button
            className="btn-ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(pix.payload).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 2500)
            }}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Código copiado' : 'Copiar Pix copia e cola'}
          </button>
          <p className="text-mute">Depois de pagar, esta tela abre sozinha. Aguardando o pagamento…</p>
        </div>
      )}

      {tab === 'card' && (
        <form onSubmit={payCard} className="space-y-3">
          <input className="field" inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} required />
          <input className="field" autoComplete="cc-name" placeholder="Nome como está no cartão" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="field" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value })} required />
            <input className="field" inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" value={card.ccv} onChange={e => setCard({ ...card, ccv: e.target.value })} required />
          </div>
          {cpfField}
          <input className="field" type="email" autoComplete="email" placeholder="Seu e-mail" value={holder.email} onChange={e => setHolder({ ...holder, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="field" inputMode="numeric" autoComplete="postal-code" placeholder="CEP" value={holder.cep} onChange={e => setHolder({ ...holder, cep: e.target.value })} required />
            <input className="field" placeholder="Nº da casa" value={holder.number} onChange={e => setHolder({ ...holder, number: e.target.value })} required />
          </div>
          {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
          <button className="btn-gold" disabled={busy}>
            {busy ? 'Processando…' : `Pagar ${brl(price)} no cartão`}
          </button>
          <p className="text-center text-sm text-mute">No cartão, a renovação mensal é automática.</p>
        </form>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Coins, Crown, Route, Wind } from 'lucide-react'
import Desert from '@/components/Desert'
import PaymentForm from '@/components/PaymentForm'
import { hasAccess, loadProfile, Profile } from '@/lib/profile-context'

const FEATURES = [
  { Icon: Wind, title: 'Botão "Estou com vontade"', text: 'Respiração guiada na hora da fissura.' },
  { Icon: Route, title: 'Trilha com missões', text: 'Níveis, conquistas e a sua evolução.' },
  { Icon: Bell, title: 'Lembretes que motivam', text: 'Frases de apoio nos seus horários.' },
  { Icon: Coins, title: 'Economia e progresso', text: 'Veja quanto você já deixou de gastar.' },
]

export default function Plano() {
  const router = useRouter()
  const [p, setP] = useState<Profile | null>(null)

  useEffect(() => {
    loadProfile().then(x => {
      if (!x) return router.replace('/')
      if (x.status === 'active') return router.replace('/app')
      setP(x)
    })
  }, [router])

  if (!p) return <div className="min-h-dvh" />
  const renew = p.paid_count > 0
  const inTrial = !renew && hasAccess(p)
  const price = renew ? 27.9 : 9.9

  return (
    <main className="relative min-h-dvh">
      <Desert className="absolute inset-x-0 top-0 h-64 w-full" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-transparent to-ink" />
      <div className="relative z-10 space-y-5 px-6 pb-10 pt-24 safe-top">
        <div className="text-center">
          <Crown className="mx-auto mb-2 text-gold" size={36} />
          <h1 className="font-serif text-4xl">
            {renew ? 'Renovar seu acesso' : inTrial ? 'Continue sua jornada' : 'Seu teste terminou'}
          </h1>
          <p className="mt-1 text-mute">
            {renew
              ? 'Sua trilha está esperando por você.'
              : `Você já começou, ${p.name.split(' ')[0]}. Continue avançando com o Pare de Fumar.`}
          </p>
        </div>

        {!renew && (
          <div className="panel space-y-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="flex items-center gap-4">
                <Icon className="shrink-0 text-gold" size={28} strokeWidth={1.6} />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-mute">{text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="font-serif text-5xl text-gold">{renew ? 'R$ 27,90' : 'R$ 9,90'}</p>
          <p className="text-mute">{renew ? 'por mês' : 'no primeiro mês, depois R$ 27,90 por mês'}</p>
        </div>

        <PaymentForm
          product="plan"
          price={price}
          hasCustomer={!!p.asaas_customer_id}
          needsPhone={!p.phone}
          isPaid={x => x.status === 'active'}
          onPaid={() => router.replace('/app')}
        />
        <p className="text-center text-sm text-mute">Cancele quando quiser.</p>

        <Link href="/app/vontade" className="btn-ghost">
          <Wind size={20} /> Estou com vontade agora
        </Link>
        {inTrial && (
          <Link href="/app" className="block py-2 text-center text-mute">
            Voltar para o app
          </Link>
        )}
      </div>
    </main>
  )
}

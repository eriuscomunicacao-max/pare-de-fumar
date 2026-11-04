'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Desert from '@/components/Desert'
import { hasAccess, loadProfile } from '@/lib/profile-context'

export default function Entrada() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadProfile().then(p => {
      if (p && hasAccess(p)) router.replace('/app')
      else setReady(true)
    })
  }, [router])

  if (!ready) return <div className="min-h-dvh" />

  return (
    <main className="relative flex min-h-dvh flex-col">
      <Desert className="absolute inset-0 h-full w-full" glow={0.9} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/20 to-ink" />
      <div className="relative z-10 flex flex-1 flex-col px-6 safe-top safe-bottom">
        <div className="mt-16">
          <h1 className="font-serif text-6xl leading-[1.02] text-sand">
            Pare
            <br />
            de Fumar
          </h1>
          <p className="mt-5 font-serif text-2xl text-gold">Respire. Recomece.</p>
          <p className="mt-2 max-w-[17rem] text-lg text-sand/85">Uma vontade de cada vez.</p>
        </div>
        <div className="mt-auto space-y-3 pb-6 pt-10">
          <Link href="/acesso" className="btn-gold">
            Já comprei, entrar no app
          </Link>
          <Link href="/metodo" className="btn-ghost">
            Quero conhecer o Método
          </Link>
        </div>
      </div>
    </main>
  )
}

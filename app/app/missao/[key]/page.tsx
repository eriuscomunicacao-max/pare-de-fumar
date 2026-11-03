'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import Desert from '@/components/Desert'
import { getMission } from '@/lib/missions'
import { supabase } from '@/lib/supabase-browser'

export default function Missao() {
  const { key } = useParams<{ key: string }>()
  const m = getMission(key)
  const [done, setDone] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    supabase
      .from('missions_done')
      .select('id')
      .eq('mission_key', key)
      .eq('done_on', today)
      .then(({ data }) => setDone(!!data?.length))
  }, [key, today])

  if (!m) return <main className="p-6">Missão não encontrada.</main>

  async function complete() {
    const { data: s } = await supabase.auth.getSession()
    await supabase
      .from('missions_done')
      .upsert({ user_id: s.session!.user.id, mission_key: key, done_on: today }, { onConflict: 'user_id,mission_key,done_on' })
    setDone(true)
  }

  return (
    <main className="space-y-5 px-5 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>
      <h1 className="font-serif text-4xl">Missão de hoje</h1>
      <div className="overflow-hidden rounded-3xl border border-line">
        <Desert className="h-40 w-full" glow={0.9} />
      </div>
      <h2 className="font-serif text-3xl leading-tight">{m.title}</h2>
      <p className="text-lg text-mute">{m.body}</p>
      <div className="panel flex items-center gap-4">
        <Star className="text-gold" size={36} fill="#e8c36a" />
        <div>
          <p className="text-sm text-mute">Recompensa</p>
          <p className="font-serif text-2xl">+1 conquista</p>
          <p className="text-sm text-mute">Mais um passo na sua trilha.</p>
        </div>
      </div>
      {done ? (
        <p className="rounded-full border border-leaf py-4 text-center text-lg text-leaf">Missão concluída hoje</p>
      ) : (
        <button className="btn-gold" onClick={complete}>
          Concluir missão
        </button>
      )}
    </main>
  )
}

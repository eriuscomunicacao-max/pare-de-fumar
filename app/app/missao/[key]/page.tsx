'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import Desert from '@/components/Desert'
import { todayBR } from '@/lib/date'
import { getMission } from '@/lib/missions'
import { supabase } from '@/lib/supabase-browser'

const TRIGGERS = [
  'Café',
  'Depois de comer',
  'Estresse',
  'Ansiedade',
  'Tédio',
  'Bebida',
  'Festa ou amigos',
  'Discussão',
  'Trabalho',
  'Outro',
]

export default function Missao() {
  const { key } = useParams<{ key: string }>()
  const router = useRouter()
  const m = getMission(key)
  const isTrigger = key === 'gatilho'
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [trigger, setTrigger] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    supabase
      .from('missions_done')
      .select('id')
      .eq('mission_key', key)
      .eq('done_on', todayBR())
      .then(({ data }) => setDone(!!data?.length))
  }, [key])

  if (!m) return <main className="p-6">Missão não encontrada.</main>

  async function finish() {
    if (isTrigger && !trigger) {
      setErr('Escolha o que deu vontade de fumar.')
      return
    }
    setErr('')
    setBusy(true)
    const { data: s } = await supabase.auth.getSession()
    const uid = s.session!.user.id

    if (isTrigger) {
      const { error } = await supabase
        .from('trigger_logs')
        .insert({ user_id: uid, trigger, note: note.trim() || null })
      if (error) {
        setErr('Não foi possível salvar. Tente de novo.')
        setBusy(false)
        return
      }
    }
    await supabase
      .from('missions_done')
      .upsert({ user_id: uid, mission_key: key, done_on: todayBR() }, { onConflict: 'user_id,mission_key,done_on' })

    router.push('/app')
  }

  return (
    <main className="space-y-5 px-5 pb-8 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>

      {isTrigger ? (
        <>
          <h1 className="font-serif text-4xl">Registrar um gatilho</h1>
          <p className="text-lg text-mute">
            O que deu vontade de fumar? Entender isso é o que mais ajuda a vencer a próxima vez.
          </p>

          <div className="flex flex-wrap gap-2">
            {TRIGGERS.map(t => (
              <button key={t} onClick={() => setTrigger(t)} className={`chip ${trigger === t ? 'chip-on' : ''}`}>
                {t}
              </button>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-sand/90">Conte o que aconteceu (opcional)</span>
            <textarea
              className="field min-h-28"
              value={note}
              maxLength={300}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex.: discuti no trabalho e fui direto para o cigarro"
            />
          </label>
          <p className="text-sm text-mute">Fica guardado só para você, no seu histórico.</p>
          {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
          <button className="btn-gold" disabled={busy} onClick={finish}>
            {busy ? 'Salvando…' : done ? 'Salvar gatilho' : 'Salvar e concluir missão'}
          </button>
        </>
      ) : (
        <>
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
            <button className="btn-gold" disabled={busy} onClick={finish}>
              {busy ? 'Salvando…' : 'Concluir missão'}
            </button>
          )}
        </>
      )}
    </main>
  )
}

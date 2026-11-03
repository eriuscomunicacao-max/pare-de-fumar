'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useProfile } from '@/lib/profile-context'

type Entry = { id: string; content: string; created_at: string }

const PERGUNTAS = [
  'Como estou me sentindo?',
  'O que funcionou hoje?',
  'O que fez eu querer parar?',
  'O que quero recuperar?',
]

export default function Diario() {
  const { profile, refresh } = useProfile()
  const [entries, setEntries] = useState<Entry[]>([])
  const [text, setText] = useState('')
  const [why, setWhy] = useState(profile.why || '')
  const [pergunta, setPergunta] = useState(PERGUNTAS[0])
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('journal').select('*').order('created_at', { ascending: false }).limit(50)
    setEntries((data as Entry[]) || [])
  }, [])
  useEffect(() => {
    load()
  }, [load])

  async function add() {
    if (!text.trim()) return
    const { data: s } = await supabase.auth.getSession()
    await supabase.from('journal').insert({ user_id: s.session!.user.id, content: text.trim() })
    setText('')
    load()
  }

  async function saveWhy() {
    await supabase.from('profiles').update({ why: why.trim() || null }).eq('id', profile.id)
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="space-y-5 px-5 safe-top">
      <div className="pt-3">
        <h1 className="font-serif text-4xl">Diário</h1>
        <p className="text-mute">Só você lê o que escreve aqui.</p>
      </div>

      <section className="panel space-y-3">
        <label className="font-serif text-xl" htmlFor="why">Por que eu decidi parar</label>
        <textarea id="why" className="field min-h-24" value={why} onChange={e => setWhy(e.target.value)} placeholder="Escreva uma mensagem para você mesmo(a)" />
        <button className="btn-ghost" onClick={saveWhy}>{saved ? 'Salvo' : 'Salvar meu motivo'}</button>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PERGUNTAS.map(p => (
            <button key={p} onClick={() => setPergunta(p)} className={`chip text-sm ${pergunta === p ? 'chip-on' : ''}`}>{p}</button>
          ))}
        </div>
        <textarea className="field min-h-28" value={text} onChange={e => setText(e.target.value)} placeholder={pergunta} />
        <button className="btn-gold" onClick={add}>Salvar no diário</button>
      </section>

      <section className="space-y-3 pb-4">
        {entries.length === 0 && <p className="text-mute">Suas anotações aparecem aqui.</p>}
        {entries.map(e => (
          <article key={e.id} className="panel">
            <p className="mb-1 text-sm text-mute">
              {new Date(e.created_at).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="whitespace-pre-wrap text-lg">{e.content}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

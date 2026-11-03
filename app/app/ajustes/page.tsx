'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import InstallGuide from '@/components/InstallGuide'
import NotifyButton from '@/components/NotifyButton'
import { supabase } from '@/lib/supabase-browser'
import { useProfile } from '@/lib/profile-context'

const HORAS = [7, 8, 9, 10, 12, 13, 15, 17, 18, 20, 21, 22]

export default function Ajustes() {
  const { profile, refresh } = useProfile()
  const [hours, setHours] = useState<number[]>(profile.notify_hours)
  const [ok, setOk] = useState(false)

  const toggle = (h: number) => setHours(x => (x.includes(h) ? x.filter(i => i !== h) : [...x, h].sort((a, b) => a - b)))

  async function save() {
    await supabase.from('profiles').update({ notify_hours: hours }).eq('id', profile.id)
    await refresh()
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  return (
    <main className="space-y-5 px-5 pb-6 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>
      <h1 className="font-serif text-4xl">Ajustes</h1>

      <section className="panel space-y-3">
        <h2 className="font-serif text-2xl">Lembretes</h2>
        <NotifyButton />
        <p className="text-mute">Em quais horários você quer receber uma frase de apoio?</p>
        <div className="flex flex-wrap gap-2">
          {HORAS.map(h => (
            <button key={h} onClick={() => toggle(h)} className={`chip ${hours.includes(h) ? 'chip-on' : ''}`}>
              {String(h).padStart(2, '0')}h
            </button>
          ))}
        </div>
        <button className="btn-ghost" onClick={save}>{ok ? 'Salvo' : 'Salvar horários'}</button>
      </section>

      <InstallGuide always />

      <section className="panel space-y-1">
        <p className="text-mute">Conta</p>
        <p className="text-lg">{profile.name}</p>
        <p className="text-mute">{profile.phone}</p>
      </section>
    </main>
  )
}

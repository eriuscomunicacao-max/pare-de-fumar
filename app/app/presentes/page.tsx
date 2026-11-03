'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Gift, Lock } from 'lucide-react'
import { apiPost } from '@/lib/api'
import {
  GIFT1_COVER,
  GIFT1_DAYS,
  GIFT1_URL,
  GIFT2_COVER,
  GIFT2_DAYS,
  daysLeft,
  gift1Open,
  gift2Open,
} from '@/lib/gifts'
import { useNow, useProfile } from '@/lib/profile-context'

const RETRY_WINDOW_MS = 15 * 60 * 1000

export default function Presentes() {
  const { profile, refresh } = useProfile()
  const now = useNow(30000)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ask, setAsk] = useState(false)
  const [url2, setUrl2] = useState('')

  const open1 = gift1Open(profile, now)
  const open2 = gift2Open(profile, now)
  const got2 = profile.gift2_downloaded_at ? new Date(profile.gift2_downloaded_at).getTime() : null
  const retry2 = got2 !== null && now - got2 < RETRY_WINDOW_MS
  const used2 = got2 !== null && !retry2

  async function claim2() {
    setErr('')
    setBusy(true)
    try {
      const r = await apiPost<{ url: string }>('/api/gift', { gift: 2 })
      setUrl2(r.url)
      window.open(r.url, '_blank')
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    }
    setAsk(false)
    setBusy(false)
  }

  return (
    <main className="space-y-5 px-5 pb-6 safe-top">
      <Link href="/app" className="inline-flex items-center gap-1 py-3 text-mute">
        <ArrowLeft size={20} /> Voltar
      </Link>
      <div>
        <h1 className="font-serif text-4xl">Seus presentes</h1>
        <p className="text-mute">Materiais para te ajudar a continuar.</p>
      </div>

      {/* presente 1 */}
      <section className="panel space-y-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GIFT1_COVER}
          alt="Capa do presente"
          className="w-full rounded-xl"
          style={open1 ? undefined : { filter: 'grayscale(1) opacity(.45)' }}
        />
        <div className="space-y-3 px-2 pb-2">
          <h2 className="font-serif text-2xl">Seu primeiro presente</h2>
          {open1 ? (
            <a
              href={GIFT1_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
              onClick={() => {
                apiPost('/api/gift', { gift: 1 })
                  .then(() => refresh())
                  .catch(() => {})
              }}
            >
              <Download size={20} /> Baixar presente
            </a>
          ) : (
            <p className="flex items-center gap-2 text-mute">
              <Lock size={18} /> Chega em {daysLeft(profile.created_at, GIFT1_DAYS, now)} dia(s)
            </p>
          )}
        </div>
      </section>

      {/* presente 2 */}
      <section className="panel space-y-3 border-gold/40 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GIFT2_COVER}
          alt="Capa do maior presente"
          className="w-full rounded-xl"
          style={open2 && !used2 ? undefined : { filter: 'grayscale(1) opacity(.45)' }}
        />
        <div className="space-y-3 px-2 pb-2">
          <h2 className="flex items-center gap-2 font-serif text-2xl">
            <Gift size={22} className="text-gold" /> O maior presente
          </h2>

          {!open2 && (
            <p className="flex items-center gap-2 text-mute">
              <Lock size={18} />
              {profile.status === 'active' && profile.activated_at
                ? `Libera em ${daysLeft(profile.activated_at, GIFT2_DAYS, now)} dia(s) com o plano ativo`
                : `Libera depois de ${GIFT2_DAYS} dias com o plano ativo`}
            </p>
          )}

          {open2 && used2 && <p className="text-mute">Presente já resgatado. Ele só pode ser baixado uma vez.</p>}

          {open2 && !used2 && !ask && (
            <button className="btn-gold" disabled={busy} onClick={() => (retry2 ? claim2() : setAsk(true))}>
              <Download size={20} /> {retry2 ? 'Baixar de novo' : 'Baixar presente'}
            </button>
          )}

          {ask && (
            <div className="space-y-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
              <p className="text-sand">Esse presente só pode ser baixado uma vez. Quer baixar agora?</p>
              <button className="btn-gold" disabled={busy} onClick={claim2}>
                {busy ? 'Preparando…' : 'Sim, baixar agora'}
              </button>
              <button className="w-full py-2 text-mute" onClick={() => setAsk(false)}>
                Agora não
              </button>
            </div>
          )}

          {url2 && (
            <a href={url2} target="_blank" rel="noreferrer" className="btn-ghost">
              Se o download não começou, toque aqui
            </a>
          )}
          {retry2 && !url2 && (
            <p className="text-sm text-mute">Se o download falhou, você pode tentar de novo por alguns minutos.</p>
          )}
          {err && <p className="rounded-xl bg-red-950/60 p-3 text-red-200">{err}</p>}
        </div>
      </section>
    </main>
  )
}

'use client'

import Link from 'next/link'
import { Download, Gift, Lock } from 'lucide-react'
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

// Prêmios sempre visíveis na tela inicial, para todo mundo.
export default function PrizesCard() {
  const { profile, refresh } = useProfile()
  const now = useNow(60000)

  const active = profile.status === 'active'
  const open1 = gift1Open(profile, now)
  const open2 = gift2Open(profile, now)
  const got2 = profile.gift2_downloaded_at ? new Date(profile.gift2_downloaded_at).getTime() : null
  const used2 = got2 !== null && now - got2 >= RETRY_WINDOW_MS

  const left1 = daysLeft(profile.created_at, GIFT1_DAYS, now)
  const left2 = profile.activated_at ? daysLeft(profile.activated_at, GIFT2_DAYS, now) : GIFT2_DAYS

  const status1 = open1
    ? 'Seu prêmio chegou!'
    : active
      ? `Libera em ${left1} dia(s)`
      : 'Chega 3 dias depois de criar a conta, com o plano ativo'
  const status2 = used2
    ? 'Já resgatado. Só podia ser baixado uma vez.'
    : open2
      ? 'O maior prêmio chegou! Só pode ser baixado 1 vez.'
      : active
        ? `Libera em ${left2} dia(s) com o plano ativo`
        : 'Chega depois de 7 dias com o plano ativo'

  const locked = (
    <div className="btn-ghost !py-3 !text-base opacity-60">
      <Lock size={16} /> Bloqueado
    </div>
  )

  return (
    <section className="panel space-y-4 border-gold/40">
      <div>
        <h2 className="flex items-center gap-2 font-serif text-2xl">
          <Gift size={22} className="text-gold" /> Seus prêmios
        </h2>
        <p className="text-mute">Em 3 dias você ganha o primeiro. Em 7 dias, o maior de todos.</p>
      </div>

      {/* prêmio 1 */}
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GIFT1_COVER}
          alt="Prêmio 1"
          className="h-28 w-24 shrink-0 rounded-xl object-cover"
          style={open1 ? undefined : { filter: 'grayscale(1) opacity(.5)' }}
        />
        <div className="flex flex-1 flex-col justify-between gap-2">
          <div>
            <p className="font-semibold">Prêmio 1 · LIMPE SEUS PULMÕES! Passo a passo completo!</p>
            <p className="text-sm text-mute">{status1}</p>
          </div>
          {open1 ? (
            <a
              href={GIFT1_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-gold !py-3 !text-base"
              onClick={() => {
                apiPost('/api/gift', { gift: 1 })
                  .then(() => refresh())
                  .catch(() => {})
              }}
            >
              <Download size={18} /> Baixar prêmio
            </a>
          ) : (
            locked
          )}
        </div>
      </div>

      {/* prêmio 2 */}
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GIFT2_COVER}
          alt="Prêmio 2, o maior"
          className="h-28 w-24 shrink-0 rounded-xl object-cover"
          style={open2 && !used2 ? undefined : { filter: 'grayscale(1) opacity(.5)' }}
        />
        <div className="flex flex-1 flex-col justify-between gap-2">
          <div>
            <p className="font-semibold">Prêmio 2, PARE DE FUMAR EM 7 DIAS!</p>
            <p className="text-sm text-mute">{status2}</p>
          </div>
          {open2 && !used2 ? (
            <Link href="/app/presentes" className="btn-gold !py-3 !text-base">
              <Download size={18} /> Baixar (só 1 vez)
            </Link>
          ) : used2 ? (
            <div className="btn-ghost !py-3 !text-base opacity-60">Já resgatado</div>
          ) : (
            locked
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gift } from 'lucide-react'
import { gift1Open, gift2Open } from '@/lib/gifts'
import { useNow, useProfile } from '@/lib/profile-context'

// Barra vermelha em todas as telas quando existe um presente para baixar.
export default function GiftBar() {
  const { profile } = useProfile()
  const now = useNow(60000)
  const path = usePathname()

  // nunca atrapalha a ajuda na hora da vontade
  if (path.startsWith('/app/vontade') || path.startsWith('/app/presentes')) return null

  const g2 = gift2Open(profile, now) && !profile.gift2_downloaded_at
  const g1 = gift1Open(profile, now) && !profile.gift1_downloaded_at
  if (!g1 && !g2) return null

  return (
    <Link
      href="/app/presentes"
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-red-600 px-4 pb-2 pt-[max(env(safe-area-inset-top),8px)] text-center text-sm font-semibold text-white"
    >
      <Gift size={18} className="shrink-0" />
      {g2 ? 'Seu maior presente chegou! Toque para baixar' : 'Você ganhou um presente! Toque para baixar'}
    </Link>
  )
}

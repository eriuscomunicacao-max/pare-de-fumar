'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, Home, Route, Wind } from 'lucide-react'

const LEFT = [
  { href: '/app', label: 'Início', Icon: Home },
  { href: '/app/trilha', label: 'Trilha', Icon: Route },
]
const RIGHT = [
  { href: '/app/progresso', label: 'Progresso', Icon: BarChart3 },
  { href: '/app/diario', label: 'Diário', Icon: BookOpen },
]

export default function BottomNav() {
  const path = usePathname()
  const item = ({ href, label, Icon }: (typeof LEFT)[number]) => {
    const on = href === '/app' ? path === '/app' : path.startsWith(href)
    return (
      <li key={href} className="flex-1">
        <Link
          href={href}
          className={`flex flex-col items-center gap-1 py-2.5 text-xs ${on ? 'text-gold' : 'text-mute'}`}
        >
          <Icon size={24} strokeWidth={on ? 2.4 : 1.8} />
          {label}
        </Link>
      </li>
    )
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-end">
        {LEFT.map(item)}
        {/* sempre à mão: ajuda na hora da vontade */}
        <li className="flex-1 text-center">
          <Link
            href="/app/vontade"
            aria-label="Estou com vontade"
            className="mx-auto -mt-7 flex h-16 w-16 animate-pulseRing items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_24px_rgba(232,195,106,0.55)] active:scale-95"
          >
            <Wind size={30} strokeWidth={2.4} />
          </Link>
          <span className="block pb-2 pt-0.5 text-xs font-semibold text-gold">Vontade</span>
        </li>
        {RIGHT.map(item)}
      </ul>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, Home, Route } from 'lucide-react'

const ITEMS = [
  { href: '/app', label: 'Início', Icon: Home },
  { href: '/app/trilha', label: 'Trilha', Icon: Route },
  { href: '/app/progresso', label: 'Progresso', Icon: BarChart3 },
  { href: '/app/diario', label: 'Diário', Icon: BookOpen },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, Icon }) => {
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
        })}
      </ul>
    </nav>
  )
}

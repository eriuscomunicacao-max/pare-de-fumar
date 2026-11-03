'use client'

import { useEffect, useState } from 'react'
import { NODES, iconFor, levelInfo } from '@/lib/journey'
import { useNow, useProfile } from '@/lib/profile-context'

// Comemoração quando a pessoa chega a um novo marco da trilha.
export default function LevelUpModal() {
  const { profile } = useProfile()
  const now = useNow(30000)
  const [show, setShow] = useState<number | null>(null)

  const seconds = (now - new Date(profile.quit_at).getTime()) / 1000
  const { idx } = levelInfo(seconds)
  // a chave muda quando a pessoa recomeça, então os marcos comemoram de novo
  const key = `lvl:${profile.id}:${new Date(profile.quit_at).getTime()}`

  useEffect(() => {
    const seen = Number(localStorage.getItem(key) ?? '0')
    if (idx > seen) setShow(idx)
  }, [idx, key])

  if (show === null) return null
  const node = NODES[show]
  const icon = iconFor(show)

  function close() {
    localStorage.setItem(key, String(show))
    setShow(null)
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-ink/95 px-6 text-center">
      <style>{`
        @keyframes confetti-fall{0%{transform:translateY(-10vh) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:.9}}
        @keyframes badge-in{0%{transform:scale(.3) rotate(-12deg);opacity:0}70%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0)}}
      `}</style>
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            background: ['#e8c36a', '#6fbf8e', '#f3ece0', '#d98c3f'][i % 4],
            animation: `confetti-fall ${3 + (i % 5) * 0.5}s linear ${(i % 7) * 0.25}s infinite`,
          }}
        />
      ))}
      <p className="relative font-serif text-2xl text-gold">Conquista desbloqueada</p>
      <div className="relative my-6" style={{ animation: 'badge-in .8s ease-out both' }}>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt={node.name} className="h-44 w-44 object-contain drop-shadow-[0_0_30px_rgba(232,195,106,0.7)]" />
        ) : (
          <span className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-gold bg-gold/20 font-serif text-6xl text-gold">
            {show}
          </span>
        )}
      </div>
      <h1 className="relative font-serif text-5xl">{node.name}</h1>
      <p className="relative mt-3 text-xl text-sand/90">{node.label} sem fumar. Cada vontade superada abre um novo caminho.</p>
      <button className="btn-gold relative mt-10 max-w-xs" onClick={close}>
        Continuar
      </button>
    </div>
  )
}

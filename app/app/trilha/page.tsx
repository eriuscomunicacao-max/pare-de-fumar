'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag } from 'lucide-react'
import Desert from '@/components/Desert'
import { NODES, iconFor, levelInfo } from '@/lib/journey'
import { supabase } from '@/lib/supabase-browser'
import { useNow, useProfile } from '@/lib/profile-context'

const W = 360
const GAP = 135
const PAD = 90
const BIG = 100000

const seg = (arr: { x: number; y: number }[]) =>
  arr
    .map((p, i) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `C ${arr[i - 1].x} ${arr[i - 1].y - GAP / 2} ${p.x} ${p.y + GAP / 2} ${p.x} ${p.y}`
    )
    .join(' ')

export default function Trilha() {
  const { profile, refresh } = useProfile()
  const now = useNow(30000)
  const seconds = (now - new Date(profile.quit_at).getTime()) / 1000
  const { idx, progress } = levelInfo(seconds)
  const hours = seconds / 3600
  const last = NODES.length - 1

  const goalSaved = Math.min(last, Math.max(0, profile.goal_idx ?? last))
  const goal = goalSaved > idx ? goalSaved : last

  const H = last * GAP + PAD * 2
  const pts = useMemo(
    () => NODES.map((n, i) => ({ ...n, i, x: W / 2 + 90 * Math.sin(i * 1.25), y: H - PAD - i * GAP })),
    [H]
  )
  const dAll = seg(pts)
  const dGoal = seg(pts.slice(0, goal + 1))
  const dDone = seg(pts.slice(0, idx + 1))
  const dCur = seg(pts.slice(0, Math.min(idx + 1, last) + 1))

  const doneRef = useRef<SVGPathElement>(null)
  const curRef = useRef<SVGPathElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(0)
  const [marker, setMarker] = useState<{ x: number; y: number }>({ x: pts[0].x, y: pts[0].y })
  const [sel, setSel] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const userScrolled = useRef(false)

  // animação: do começo até a posição atual
  useEffect(() => {
    const done = doneRef.current
    const cur = curRef.current
    if (!done || !cur) return
    const lDone = idx === 0 ? 0 : done.getTotalLength()
    const lCur = cur.getTotalLength()
    const target = idx >= last ? lDone : lDone + (lCur - lDone) * progress
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stopFollow = () => (userScrolled.current = true)
    window.addEventListener('touchstart', stopFollow, { passive: true })
    window.addEventListener('wheel', stopFollow, { passive: true })

    const place = (l: number) => {
      const pt = cur.getPointAtLength(l)
      setPos(l)
      setMarker({ x: pt.x, y: pt.y })
      const box = boxRef.current
      if (box && !userScrolled.current) {
        const r = box.getBoundingClientRect()
        const y = r.top + window.scrollY + (pt.y / H) * r.height
        window.scrollTo({ top: y - window.innerHeight / 2 })
      }
    }

    if (reduce) {
      place(target)
    } else {
      const dur = 2600
      const t0 = performance.now()
      let raf = 0
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur)
        place(target * (1 - Math.pow(1 - k, 3)))
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('touchstart', stopFollow)
        window.removeEventListener('wheel', stopFollow)
      }
    }
    return () => {
      window.removeEventListener('touchstart', stopFollow)
      window.removeEventListener('wheel', stopFollow)
    }
  }, [idx, progress > 0.5, H]) // eslint-disable-line react-hooks/exhaustive-deps

  async function setGoal(i: number) {
    setSaving(true)
    await supabase.from('profiles').update({ goal_idx: i }).eq('id', profile.id)
    await refresh()
    setSaving(false)
    setSel(null)
  }

  const selNode = sel !== null ? pts[sel] : null

  return (
    <main>
      <div className="space-y-3 px-5 pb-3 pt-3 safe-top">
        <div>
          <h1 className="font-serif text-4xl">Minha trilha</h1>
          <p className="text-mute">Cada passo conta.</p>
        </div>
        <div className="flex items-center justify-between text-sm text-mute">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sand/60" /> {NODES[0].label}</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-gold" /> Você: {NODES[idx].name}</span>
          <span className="flex items-center gap-1.5"><Flag size={14} className="text-gold" /> Meta: {NODES[goal].name}</span>
        </div>
      </div>

      <div ref={boxRef} className="relative mx-3 overflow-hidden rounded-3xl border border-line" style={{ aspectRatio: `${W} / ${H}` }}>
        <Desert className="absolute inset-0 h-full w-full opacity-60" glow={0.5} />
        <div className="absolute inset-0 bg-ink/55" />

        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
          <path d={dAll} fill="none" stroke="#f3ece0" strokeOpacity="0.12" strokeWidth="12" strokeLinecap="round" />
          {/* caminho até a meta */}
          <path d={dGoal} fill="none" stroke="#e8c36a" strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 11" />
          {/* trecho percorrido, animado */}
          <path
            ref={curRef}
            d={dCur}
            fill="none"
            stroke="#e8c36a"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${pos} ${BIG}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(232,195,106,.7))' }}
          />
          <path ref={doneRef} d={dDone} fill="none" stroke="none" />
        </svg>

        {pts.map(p => {
          const reached = hours >= p.hours
          const isGoal = p.i === goal
          const icon = iconFor(p.i)
          return (
            <button
              key={p.name}
              onClick={() => setSel(p.i)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
            >
              {isGoal && (
                <span className="mb-1 flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-ink">
                  <Flag size={12} /> Minha meta
                </span>
              )}
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={icon}
                  alt={p.name}
                  className={`h-16 w-16 object-contain transition ${isGoal ? 'animate-pulseRing rounded-full' : ''}`}
                  style={{ filter: reached ? 'drop-shadow(0 0 8px rgba(232,195,106,.6))' : 'grayscale(1) opacity(.45)' }}
                />
              ) : (
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-serif text-lg ${
                    reached ? 'border-gold bg-gold/25 text-gold' : 'border-line bg-card text-mute'
                  } ${isGoal ? 'animate-pulseRing' : ''}`}
                >
                  {p.i}
                </span>
              )}
              <span className="mt-1 rounded-lg bg-ink/85 px-2.5 py-1 text-center">
                <span className={`block text-sm font-semibold ${reached ? 'text-sand' : 'text-mute'}`}>{p.name}</span>
                <span className="block text-xs text-mute">{p.label}</span>
              </span>
            </button>
          )
        })}

        {/* você está aqui */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(marker.x / W) * 100}%`, top: `${(marker.y / H) * 100}%` }}
        >
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-ink">
            Você está aqui
          </span>
          <span className="block h-5 w-5 animate-pulseRing rounded-full border-[3px] border-ink bg-gold" />
        </div>
      </div>

      {selNode && (
        <div className="safe-bottom fixed inset-x-0 bottom-[4.5rem] z-40 mx-auto max-w-md px-4">
          <div className="panel space-y-3 border-gold/40 bg-card shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-2xl">{selNode.name}</p>
                <p className="text-mute">{selNode.label} sem fumar</p>
              </div>
              <button className="text-mute" onClick={() => setSel(null)}>Fechar</button>
            </div>
            {selNode.i > idx && selNode.i !== goal && (
              <button className="btn-gold !py-3 !text-base" disabled={saving} onClick={() => setGoal(selNode.i)}>
                <Flag size={18} /> Definir como minha meta
              </button>
            )}
            {selNode.i === goal && <p className="text-gold">Esta é a sua meta.</p>}
            {selNode.i <= idx && <p className="text-leaf">Conquistado.</p>}
          </div>
        </div>
      )}
    </main>
  )
}

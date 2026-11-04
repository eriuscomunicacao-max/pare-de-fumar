'use client'

import { useRef, useState } from 'react'
import { Bell, Wind } from 'lucide-react'

function Phone({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="shrink-0 basis-[66%] snap-center first:ml-6 last:mr-6">
      <div className="mx-auto aspect-[9/17] overflow-hidden rounded-[2rem] border-4 border-line bg-ink p-4 shadow-[0_0_40px_rgba(232,195,106,0.15)]">
        {children}
      </div>
      <p className="mt-2 text-center text-sm text-mute">{title}</p>
    </div>
  )
}

const SCREENS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Botão "Estou com vontade"',
    body: (
      <div className="space-y-3 text-sand">
        <p className="font-serif text-2xl leading-tight">Estou com vontade</p>
        <p className="text-xs text-mute">Tudo bem. Isso passa. Você consegue.</p>
        <p className="pt-1 text-sm">Como está a vontade?</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={`flex h-8 flex-1 items-center justify-center rounded-full border text-sm ${
                n === 3 ? 'border-gold bg-gold text-ink' : 'border-line bg-card'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Ansiedade', 'Estresse', 'Café', 'Tédio'].map(t => (
            <span
              key={t}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                t === 'Café' ? 'border-gold bg-gold/15 text-gold' : 'border-line bg-card'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-semibold text-ink">
          <Wind size={16} /> Respirar por 3 min
        </div>
      </div>
    ),
  },
  {
    title: 'Respiração guiada de 3 minutos',
    body: (
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-sand">
        <p className="font-serif text-2xl">Inspire fundo</p>
        <div className="h-32 w-32 rounded-full bg-gradient-to-b from-gold/80 to-orange-700/60 shadow-[0_0_50px_rgba(232,195,106,0.4)]" />
        <p className="font-serif text-4xl tabular-nums">02:41</p>
      </div>
    ),
  },
  {
    title: 'Trilha com conquistas',
    body: (
      <div className="flex h-full flex-col text-sand">
        <p className="font-serif text-2xl">Minha trilha</p>
        <svg viewBox="0 0 120 190" className="mt-1 flex-1">
          <path d="M40 180 C 100 150, 10 130, 60 105 C 105 82, 15 60, 60 38" fill="none" stroke="#f3ece0" strokeOpacity=".15" strokeWidth="7" strokeLinecap="round" />
          <path d="M40 180 C 100 150, 10 130, 60 105" fill="none" stroke="#e8c36a" strokeWidth="4" strokeLinecap="round" />
          {[
            [40, 180, true],
            [60, 105, true],
            [60, 38, false],
          ].map(([x, y, on], i) => (
            <circle key={i} cx={x as number} cy={y as number} r="8" fill={on ? '#e8c36a' : '#15201b'} stroke={on ? '#ffe3a0' : '#24332c'} strokeWidth="2" />
          ))}
          <text x="52" y="184" fontSize="8" fill="#f3ece0">Primeiro Dia</text>
          <text x="72" y="108" fontSize="8" fill="#f3ece0">Fôlego Novo</text>
          <text x="72" y="41" fontSize="8" fill="#98a69d">Travessia</text>
        </svg>
      </div>
    ),
  },
  {
    title: 'Seu progresso, ao vivo',
    body: (
      <div className="space-y-3 text-sand">
        <p className="font-serif text-2xl">Meu progresso</p>
        <p className="text-xs text-mute">Livre do cigarro há</p>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            ['03', 'dias'],
            ['04', 'horas'],
            ['12', 'min'],
            ['08', 'seg'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-lg bg-card py-2 text-center">
              <p className="font-serif text-xl text-gold">{v}</p>
              <p className="text-[10px] text-mute">{l}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-line bg-card p-2">
            <p className="font-serif text-lg">R$ 126</p>
            <p className="text-[10px] text-mute">economizados</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-2">
            <p className="font-serif text-lg">42</p>
            <p className="text-[10px] text-mute">vontades superadas</p>
          </div>
        </div>
        <div className="flex h-14 items-end gap-1.5">
          {[2, 3, 2, 5, 4, 6, 7].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-leaf/80" style={{ height: `${h * 12}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Companheiro IA',
    body: (
      <div className="flex h-full flex-col gap-2 text-sand">
        <p className="font-serif text-xl">Companheiro</p>
        <div className="rounded-2xl bg-card px-3 py-2 text-xs leading-snug">
          Olá! Estou aqui com você. O que está sentindo agora?
        </div>
        <div className="ml-auto rounded-2xl bg-gold px-3 py-2 text-xs text-ink">Estou ansioso</div>
        <div className="rounded-2xl bg-card px-3 py-2 text-xs leading-snug">
          A vontade costuma passar em poucos minutos. Vamos respirar juntos por 3 minutos?
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {['Quero uma ação rápida', 'Estou entediado'].map(t => (
            <span key={t} className="rounded-full border border-line bg-card px-2.5 py-1 text-[10px]">
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Lembretes na hora certa',
    body: (
      <div className="flex h-full flex-col justify-center gap-3 text-sand">
        <div className="rounded-2xl border border-line bg-card p-3">
          <p className="flex items-center gap-1.5 text-[11px] text-mute">
            <Bell size={12} /> Pare de Fumar · agora
          </p>
          <p className="mt-1 text-sm leading-snug">Uma vontade dura poucos minutos. Você é maior que ela.</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-3 opacity-70">
          <p className="flex items-center gap-1.5 text-[11px] text-mute">
            <Bell size={12} /> Pare de Fumar · 13:00
          </p>
          <p className="mt-1 text-sm leading-snug">Se a vontade vier, o botão está aqui para você.</p>
        </div>
      </div>
    ),
  },
]

// Carrossel de telas do app, de ponta a ponta. Passe `shots` para usar prints reais.
export default function AppShots({ shots = [] }: { shots?: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const total = shots.length || SCREENS.length

  return (
    <div>
      <div
        ref={ref}
        onScroll={e => {
          const el = e.currentTarget
          setI(Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth || 1)) * (total - 1)))
        }}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shots.length > 0
          ? shots.map(src => (
              <div key={src} className="shrink-0 basis-[66%] snap-center first:ml-6 last:mr-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Tela do app"
                  loading="lazy"
                  className="mx-auto w-full rounded-[2rem] border-4 border-line"
                />
              </div>
            ))
          : SCREENS.map(s => (
              <Phone key={s.title} title={s.title}>
                {s.body}
              </Phone>
            ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {Array.from({ length: total }, (_, k) => (
          <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-gold' : 'w-1.5 bg-line'}`} />
        ))}
      </div>
      {shots.length === 0 && <p className="mt-1 text-center text-xs text-mute">Telas do app. Valores de exemplo.</p>}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Wind } from 'lucide-react'
import { enablePush, pushSupported } from '@/lib/push'
import InstallGuide from './InstallGuide'

type State = 'loading' | 'ok' | 'ask' | 'denied' | 'ios'
const SKIP = 'gate-skip'

// Tela cheia que insiste até a pessoa aceitar as notificações.
export default function NotifyGate() {
  const [state, setState] = useState<State>('loading')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const path = usePathname()

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
    const skipped = sessionStorage.getItem(SKIP) === '1'

    if (ios && !standalone) return setState(skipped ? 'ok' : 'ios')
    if (!pushSupported()) return setState('ok')
    const perm = Notification.permission
    if (perm === 'granted') {
      enablePush().catch(() => {}) // garante que o aparelho está inscrito
      return setState('ok')
    }
    if (perm === 'denied') return setState(skipped ? 'ok' : 'denied')
    setState('ask')
  }, [])

  function skip() {
    sessionStorage.setItem(SKIP, '1')
    setState('ok')
  }

  async function activate() {
    setBusy(true)
    setMsg('')
    try {
      await enablePush()
      setState('ok')
    } catch (e: any) {
      console.error('push:', e)
      if (Notification.permission === 'denied') setState('denied')
      else if (e?.message === 'dismissed') setMsg('Você fechou o aviso do navegador. Toque de novo e escolha Permitir.')
      else if (e?.message === 'no-vapid') setMsg('Os lembretes ainda não foram configurados no servidor.')
      else setMsg('Não deu certo agora. Se o problema continuar, fale com o suporte.')
    }
    setBusy(false)
  }

  // a ajuda na hora da vontade nunca fica atrás desta tela
  if (state === 'loading' || state === 'ok' || path.startsWith('/app/vontade')) return null

  return (
    <div
      className="safe-top safe-bottom fixed inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-ink px-6"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 28%, rgba(232,195,106,0.28), transparent 60%)',
        animation: 'gate-pop .35s ease-out',
      }}
    >
      <style>{`
        @keyframes bell-shake{0%,100%{transform:rotate(0)}10%{transform:rotate(20deg)}20%{transform:rotate(-18deg)}30%{transform:rotate(14deg)}40%{transform:rotate(-10deg)}50%{transform:rotate(0)}}
        @keyframes ring-out{0%{transform:scale(.55);opacity:.8}100%{transform:scale(2.8);opacity:0}}
        @keyframes gate-pop{0%{transform:scale(.94);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>

      <div className="relative mt-20 flex h-40 w-40 items-center justify-center">
        {[0, 0.7, 1.4].map(d => (
          <span
            key={d}
            className="absolute h-32 w-32 rounded-full border-2 border-gold"
            style={{ animation: `ring-out 2.1s ease-out ${d}s infinite` }}
          />
        ))}
        <span
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_80px_rgba(232,195,106,0.6)]"
          style={{ animation: 'bell-shake 1.6s ease-in-out infinite' }}
        >
          <Bell size={56} strokeWidth={2.2} fill="currentColor" />
        </span>
      </div>

      {state === 'ask' && (
        <>
          <h1 className="mt-10 text-center font-serif text-4xl leading-tight">Quer receber um lembrete na hora certa?</h1>
          <p className="mt-4 max-w-xs text-center text-xl text-sand/90">
            Podemos avisar você nos horários em que a vontade costuma aparecer.
          </p>
          <div className="mt-auto w-full space-y-3 pb-6 pt-10">
            {msg && <p className="rounded-xl bg-red-950/60 p-3 text-center text-red-200">{msg}</p>}
            <button className="btn-gold !py-5 !text-xl" disabled={busy} onClick={activate}>
              <Bell size={22} /> Ativar lembretes agora
            </button>
            <p className="text-center text-sm text-mute">Toque em Permitir quando o celular perguntar.</p>
            <Link href="/app/vontade" className="btn-ghost">
              <Wind size={20} /> Estou com vontade agora
            </Link>
          </div>
        </>
      )}

      {state === 'denied' && (
        <>
          <h1 className="mt-10 text-center font-serif text-4xl leading-tight">Os lembretes estão bloqueados</h1>
          <p className="mt-4 max-w-xs text-center text-lg text-sand/90">
            Toque no cadeado ao lado do endereço (ou nas configurações do navegador), escolha{' '}
            <b>Notificações</b> e mude para <b>Permitir</b>.
          </p>
          <div className="mt-auto w-full space-y-3 pb-6 pt-10">
            <button className="btn-gold" onClick={() => location.reload()}>
              Já liberei
            </button>
            <button className="w-full py-3 text-mute" onClick={skip}>
              Continuar sem lembretes por agora
            </button>
            <Link href="/app/vontade" className="btn-ghost">
              <Wind size={20} /> Estou com vontade agora
            </Link>
          </div>
        </>
      )}

      {state === 'ios' && (
        <>
          <h1 className="mt-10 text-center font-serif text-4xl leading-tight">Instale o app para receber lembretes</h1>
          <div className="mt-6 w-full">
            <InstallGuide always />
          </div>
          <div className="mt-auto w-full pb-6 pt-8">
            <button className="w-full py-3 text-mute" onClick={skip}>
              Continuar sem lembretes por agora
            </button>
          </div>
        </>
      )}
    </div>
  )
}

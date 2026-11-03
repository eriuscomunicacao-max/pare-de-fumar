'use client'

import { useEffect, useState } from 'react'
import { Plus, Share } from 'lucide-react'

export function useInstallState() {
  const [state, setState] = useState({ ios: false, standalone: true })
  useEffect(() => {
    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
    setState({ ios, standalone })
  }, [])
  return state
}

// Tutorial para instalar no iPhone (necessário para receber notificações)
export default function InstallGuide({ always = false }: { always?: boolean }) {
  const { ios, standalone } = useInstallState()
  if (standalone || (!ios && !always)) return null
  return (
    <div className="panel space-y-3">
      <p className="font-serif text-xl text-gold">Instale o Pare de Fumar no seu celular</p>
      <p className="text-mute">Assim ele fica na tela inicial e você recebe os lembretes.</p>
      <ol className="space-y-3 text-sand">
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line">
            <Share size={18} />
          </span>
          <span>
            Toque em <b>Compartilhar</b>, na barra do Safari.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line">
            <Plus size={18} />
          </span>
          <span>
            Escolha <b>Adicionar à Tela de Início</b>.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line text-sm font-bold">
            3
          </span>
          <span>Abra o Pare de Fumar pelo ícone novo e ative os lembretes.</span>
        </li>
      </ol>
      {!ios && (
        <p className="text-sm text-mute">
          No Android, toque nos três pontinhos do navegador e escolha <b>Instalar app</b>.
        </p>
      )}
    </div>
  )
}

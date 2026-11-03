'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { enablePush, pushSupported } from '@/lib/push'
import { useInstallState } from './InstallGuide'

export default function NotifyButton() {
  const { ios, standalone } = useInstallState()
  const [perm, setPerm] = useState<string>('default')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if ('Notification' in window) setPerm(Notification.permission)
  }, [])

  if (ios && !standalone)
    return <p className="text-sm text-mute">No iPhone, instale o app na Tela de Início para ativar os lembretes.</p>
  if (!pushSupported()) return <p className="text-sm text-mute">Este navegador não aceita lembretes.</p>

  if (perm === 'granted')
    return (
      <div className="flex items-center gap-2 text-leaf">
        <BellRing size={20} /> Lembretes ativados neste aparelho
      </div>
    )
  if (perm === 'denied')
    return <p className="text-sm text-mute">Os lembretes estão bloqueados. Libere nas configurações do navegador.</p>

  return (
    <div className="space-y-2">
      <button
        className="btn-gold"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setMsg('')
          try {
            await enablePush()
            setPerm('granted')
          } catch (e: any) {
            setPerm(Notification.permission)
            setMsg(e.message === 'denied' ? '' : 'Não foi possível ativar agora. Tente de novo.')
          }
          setBusy(false)
        }}
      >
        <Bell size={20} /> Ativar lembretes
      </button>
      {msg && <p className="text-sm text-red-300">{msg}</p>}
    </div>
  )
}

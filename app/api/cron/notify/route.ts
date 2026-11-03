import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { admin } from '@/lib/supabase-admin'
import { safeEqual } from '@/lib/security'

export const dynamic = 'force-dynamic'

const FRASES = [
  'Uma vontade dura poucos minutos. Você é maior que ela.',
  'Cada vontade superada abre um novo caminho.',
  'Seu ritmo também conta. Continue.',
  'Respire fundo. Você já chegou até aqui.',
  'Hoje você escolhe o seu amanhã.',
  'Você não precisa ser perfeito. Só precisa continuar.',
  'Beba um copo de água. Sua trilha continua.',
  'Um dia de cada vez. Hoje é o que importa.',
  'Se a vontade vier, o botão está aqui para você.',
  'Você está aprendendo. Isso já é progresso.',
]

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || !safeEqual(req.headers.get('authorization'), `Bearer ${secret}`))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const hour =
    Number(
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(
        new Date()
      )
    ) % 24

  const { data: users } = await admin
    .from('profiles')
    .select('id, name')
    .or(`status.eq.active,trial_ends_at.gt.${new Date().toISOString()}`)
    .contains('notify_hours', [hour])
  if (!users?.length) return NextResponse.json({ sent: 0 })

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('*')
    .in('user_id', users.map(u => u.id))

  let sent = 0
  await Promise.all(
    (subs || []).map(async s => {
      const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: 'Pare de Fumar', body: frase, url: '/app' })
        )
        sent++
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410)
          await admin.from('push_subscriptions').delete().eq('id', s.id)
      }
    })
  )
  return NextResponse.json({ sent })
}

import { NextResponse } from 'next/server'
import { admin, userFromRequest } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const user = await userFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!(await rateLimit(`push:${user.id}`, 30, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })

  const sub = await req.json()
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth || String(sub.endpoint).length > 1000)
    return NextResponse.json({ error: 'Inscrição inválida' }, { status: 400 })
  await admin.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: 'endpoint' }
  )
  return NextResponse.json({ ok: true })
}

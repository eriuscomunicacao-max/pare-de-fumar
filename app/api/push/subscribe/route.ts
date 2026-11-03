import { NextResponse } from 'next/server'
import { admin, userFromRequest } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const user = await userFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const sub = await req.json()
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth)
    return NextResponse.json({ error: 'Inscrição inválida' }, { status: 400 })
  await admin.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: 'endpoint' }
  )
  return NextResponse.json({ ok: true })
}

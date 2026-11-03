import { NextResponse } from 'next/server'
import { admin, userFromRequest } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { GIFT1_URL, gift1Open, gift2Open } from '@/lib/gifts'

// o link do presente 2 só sai daqui, depois de conferir as regras
const GIFT2_URL =
  process.env.GIFT2_URL || 'https://drive.google.com/uc?export=download&id=1nheyHkhtOeMFJeT7q9JUNVhGxIJPOv_G'
const RETRY_WINDOW_MS = 15 * 60 * 1000 // se o download falhar, pode tentar de novo por 15 min

export async function POST(req: Request) {
  const user = await userFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!(await rateLimit(`gift:${user.id}`, 20, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })

  const { gift } = await req.json()
  const { data: p } = await admin
    .from('profiles')
    .select('status, created_at, activated_at, gift1_downloaded_at, gift2_downloaded_at')
    .eq('id', user.id)
    .single()
  if (!p || p.status !== 'active')
    return NextResponse.json({ error: 'Presente disponível só no plano ativo.' }, { status: 403 })

  const now = Date.now()

  if (gift === 1) {
    if (!gift1Open(p, now)) return NextResponse.json({ error: 'Esse presente ainda não chegou.' }, { status: 403 })
    if (!p.gift1_downloaded_at)
      await admin.from('profiles').update({ gift1_downloaded_at: new Date().toISOString() }).eq('id', user.id)
    return NextResponse.json({ url: GIFT1_URL })
  }

  if (gift === 2) {
    if (!gift2Open(p, now)) return NextResponse.json({ error: 'Esse presente ainda não chegou.' }, { status: 403 })
    const got = p.gift2_downloaded_at ? new Date(p.gift2_downloaded_at).getTime() : null
    if (got && now - got > RETRY_WINDOW_MS)
      return NextResponse.json({ error: 'Esse presente já foi resgatado. Ele só pode ser baixado uma vez.' }, { status: 409 })
    if (!got)
      await admin
        .from('profiles')
        .update({ gift2_downloaded_at: new Date().toISOString() })
        .eq('id', user.id)
        .is('gift2_downloaded_at', null)
    return NextResponse.json({ url: GIFT2_URL })
  }

  return NextResponse.json({ error: 'Presente inválido' }, { status: 400 })
}

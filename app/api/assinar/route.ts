import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { admin } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/security'

// Cria uma conta ainda sem acesso, só para a pessoa poder pagar a assinatura (app + IA).
// O acesso só abre quando o pagamento da IA é confirmado (webhook do Asaas).
export async function POST(req: Request) {
  if (!(await rateLimit(`assinar:${clientIp(req)}`, 15, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429 })

  const { name } = await req.json()
  const clean = String(name || '').trim().slice(0, 60)
  if (!clean) return NextResponse.json({ error: 'Como podemos te chamar?' }, { status: 400 })

  const domain = process.env.LOGIN_EMAIL_DOMAIN || 'users.paredefumar.app'
  const email = `t${randomBytes(12).toString('hex')}@${domain}`
  const password = randomBytes(24).toString('hex')

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !data.user)
    return NextResponse.json({ error: 'Não foi possível continuar. Tente de novo.' }, { status: 500 })

  const { error: pErr } = await admin.from('profiles').insert({ id: data.user.id, name: clean, status: 'pending' })
  if (pErr) {
    await admin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ error: 'Não foi possível continuar. Tente de novo.' }, { status: 500 })
  }
  return NextResponse.json({ email, password })
}

import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { admin } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/security'

export async function POST(req: Request) {
  if (!(await rateLimit(`signup:${clientIp(req)}`, 8, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429 })

  const { name, phone, cigsPerDay, packPrice } = await req.json()
  const digits = String(phone || '').replace(/\D/g, '')
  if (!String(name || '').trim() || digits.length < 10 || digits.length > 13)
    return NextResponse.json({ error: 'Informe nome e telefone válidos.' }, { status: 400 })

  const cpd = Math.min(200, Math.max(1, Number(cigsPerDay) || 10))
  const price = Math.min(200, Math.max(1, Number(packPrice) || 12))

  const domain = process.env.LOGIN_EMAIL_DOMAIN || 'users.paredefumar.app'
  const email = `u${digits}@${domain}`
  const password = randomBytes(24).toString('hex')

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !data.user)
    return NextResponse.json(
      { error: 'Esse telefone já tem conta. Fale com o suporte para recuperar o acesso.' },
      { status: 409 }
    )

  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    name: String(name).trim().slice(0, 60),
    phone: digits,
    cigs_per_day: cpd,
    pack_price: price,
  })
  if (pErr) {
    await admin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ error: 'Esse telefone já tem conta. Fale com o suporte.' }, { status: 409 })
  }
  return NextResponse.json({ email, password })
}

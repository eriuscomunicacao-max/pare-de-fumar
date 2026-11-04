import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { admin } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/security'

const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')

export async function POST(req: Request) {
  if (!(await rateLimit(`acesso:${clientIp(req)}`, 15, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429 })

  const { email, cpf, cigsPerDay } = await req.json()
  const mail = String(email || '').trim().toLowerCase()
  const doc = digits(cpf)
  const notFound = NextResponse.json(
    {
      error:
        'Não encontramos uma compra com esses dados. Confira o e-mail e o CPF usados no pagamento. A compra pode levar alguns minutos para aparecer.',
    },
    { status: 404 }
  )
  if (!mail.includes('@') || doc.length < 11) return notFound

  const { data: rows } = await admin
    .from('purchases')
    .select('*')
    .eq('email', mail)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5)
  const pur = (rows || []).find(r => !r.doc || r.doc === doc)
  if (!pur) return notFound

  const password = randomBytes(24).toString('hex')

  // já ativou antes (outro aparelho): renova o acesso para este aparelho
  if (pur.claimed_by) {
    const { data: u } = await admin.auth.admin.getUserById(pur.claimed_by)
    if (!u?.user?.email) return NextResponse.json({ error: 'Não foi possível entrar. Fale com o suporte.' }, { status: 500 })
    const { error } = await admin.auth.admin.updateUserById(pur.claimed_by, { password })
    if (error) return NextResponse.json({ error: 'Não foi possível entrar. Tente de novo.' }, { status: 500 })
    return NextResponse.json({ email: u.user.email, password })
  }

  // primeiro acesso: cria a conta
  const domain = process.env.LOGIN_EMAIL_DOMAIN || 'users.paredefumar.app'
  const authEmail = `t${randomBytes(12).toString('hex')}@${domain}`
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
  })
  if (cErr || !created.user)
    return NextResponse.json({ error: 'Não foi possível criar o acesso. Tente de novo.' }, { status: 500 })

  const id = created.user.id
  const firstName = String(pur.name || '').trim().split(' ')[0] || 'Amigo(a)'
  const { error: pErr } = await admin.from('profiles').insert({
    id,
    name: firstName.slice(0, 60),
    cigs_per_day: Math.min(200, Math.max(1, Number(cigsPerDay) || 10)),
    status: 'active',
    activated_at: new Date().toISOString(),
  })
  if (pErr) {
    await admin.auth.admin.deleteUser(id)
    return NextResponse.json({ error: 'Não foi possível criar o acesso. Tente de novo.' }, { status: 500 })
  }

  // marca a compra como usada (só um aparelho ganha a corrida)
  const { data: claimed } = await admin
    .from('purchases')
    .update({ claimed_by: id, claimed_at: new Date().toISOString() })
    .eq('order_id', pur.order_id)
    .is('claimed_by', null)
    .select('order_id')
  if (!claimed?.length) {
    await admin.auth.admin.deleteUser(id)
    return NextResponse.json({ error: 'Tente de novo em alguns segundos.' }, { status: 409 })
  }

  return NextResponse.json({ email: authEmail, password })
}

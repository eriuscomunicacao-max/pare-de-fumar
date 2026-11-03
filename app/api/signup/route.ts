import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { admin } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/security'

const TRIAL_HOURS = 24

export async function POST(req: Request) {
  // limite generoso: muitas pessoas dividem o mesmo IP no 4G
  if (!(await rateLimit(`signup:${clientIp(req)}`, 30, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429 })

  const { name, cigsPerDay, mode } = await req.json()
  const cleanName = String(name || '').trim().slice(0, 60)
  if (!cleanName) return NextResponse.json({ error: 'Como podemos te chamar?' }, { status: 400 })

  const cpd = Math.min(200, Math.max(1, Number(cigsPerDay) || 10))

  const domain = process.env.LOGIN_EMAIL_DOMAIN || 'users.paredefumar.app'
  const email = `t${randomBytes(12).toString('hex')}@${domain}`
  const password = randomBytes(24).toString('hex')

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !data.user)
    return NextResponse.json({ error: 'Não foi possível começar agora. Tente de novo.' }, { status: 500 })

  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    name: cleanName,
    cigs_per_day: cpd,
    mode: mode === 'reduzir' ? 'reduzir' : 'parar',
    trial_ends_at: new Date(Date.now() + TRIAL_HOURS * 3600 * 1000).toISOString(),
  })
  if (pErr) {
    await admin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ error: 'Não foi possível começar agora. Tente de novo.' }, { status: 500 })
  }
  return NextResponse.json({ email, password })
}

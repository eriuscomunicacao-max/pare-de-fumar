import { NextResponse } from 'next/server'
import { admin } from '@/lib/supabase-admin'
import { safeEqual } from '@/lib/security'

const BAD = ['PAYMENT_OVERDUE', 'SUBSCRIPTION_DELETED', 'SUBSCRIPTION_INACTIVATED', 'PAYMENT_REFUNDED']
const PAID = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']

const asaasHeaders = () => ({
  'Content-Type': 'application/json',
  access_token: process.env.ASAAS_API_KEY!,
  'User-Agent': 'pare-de-fumar-app',
})

export async function POST(req: Request) {
  if (!safeEqual(req.headers.get('asaas-access-token'), process.env.ASAAS_WEBHOOK_TOKEN))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const event: string = body.event
  const subId: string | undefined = body.payment?.subscription ?? body.subscription?.id
  if (!subId) return NextResponse.json({ ok: true })

  // plano ou IA?
  let kind: 'plan' | 'ai' = 'plan'
  let { data: p } = await admin
    .from('profiles')
    .select('id, paid_count')
    .eq('asaas_subscription_id', subId)
    .maybeSingle()
  if (!p) {
    const r = await admin.from('profiles').select('id, paid_count').eq('ai_subscription_id', subId).maybeSingle()
    p = r.data
    kind = 'ai'
  }
  if (!p) return NextResponse.json({ ok: true })

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    const payId: string | undefined = body.payment?.id
    if (!payId) return NextResponse.json({ ok: true })

    // não confia só no corpo do webhook: confere o pagamento direto no Asaas
    const real = await fetch(`${process.env.ASAAS_URL}/payments/${payId}`, { headers: asaasHeaders() })
      .then(r => r.json())
      .catch(() => null)
    if (!real?.id) return NextResponse.json({ error: 'asaas indisponível' }, { status: 500 }) // Asaas tenta de novo
    if (!PAID.includes(real.status) || real.subscription !== subId)
      return NextResponse.json({ ok: true, ignored: true })

    // idempotência: cartão dispara CONFIRMED e, semanas depois, RECEIVED do mesmo pagamento
    const { error } = await admin.from('asaas_payments').insert({ payment_id: payId })
    if (error) return NextResponse.json({ ok: true, duplicate: true })

    const end = new Date()
    end.setDate(end.getDate() + 32)

    if (kind === 'ai') {
      await admin.from('profiles').update({ ai_active: true, ai_period_end: end.toISOString() }).eq('id', p.id)
    } else {
      await admin
        .from('profiles')
        .update({ status: 'active', paid_count: p.paid_count + 1, current_period_end: end.toISOString() })
        .eq('id', p.id)
      // 1º pagamento confirmado: próximas cobranças passam para 27,90
      if (p.paid_count === 0) {
        await fetch(`${process.env.ASAAS_URL}/subscriptions/${subId}`, {
          method: 'PUT',
          headers: asaasHeaders(),
          body: JSON.stringify({ value: 27.9, updatePendingPayments: false }),
        })
      }
    }
  }

  if (BAD.includes(event)) {
    await admin
      .from('profiles')
      .update(kind === 'ai' ? { ai_active: false } : { status: 'inactive' })
      .eq('id', p.id)
  }
  return NextResponse.json({ ok: true })
}

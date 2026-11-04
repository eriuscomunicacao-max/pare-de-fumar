import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { admin } from '@/lib/supabase-admin'
import { safeEqual } from '@/lib/security'

// só pedidos deste produto/oferta liberam o app (a conta pode ter outros produtos)
const OFFER_MATCH = process.env.CAKTO_OFFER_MATCH || 'p3vrbo9'
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')

export async function POST(req: Request) {
  const raw = await req.text()
  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (!secret) {
    console.error('cakto: CAKTO_WEBHOOK_SECRET não configurado')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }

  // autenticidade: secret no corpo OU assinatura HMAC no cabeçalho (as duas são da Cakto)
  let ok = safeEqual(body?.secret, secret)
  const ts = req.headers.get('x-cakto-timestamp')
  const sig = req.headers.get('x-cakto-signature')
  if (!ok && ts && sig && Math.abs(Date.now() / 1000 - Number(ts)) <= 300) {
    const expected = 'v1=' + createHmac('sha256', secret).update(`${ts}.${raw}`).digest('hex')
    ok = sig.split(',').some(s => safeEqual(s.trim(), expected))
  }
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const event: string = body.event
  const orders: any[] = (Array.isArray(body.data) ? body.data : [body.data]).filter(Boolean)

  for (const d of orders) {
    if (!d.id) continue
    const mine = JSON.stringify([d.offer?.id, d.checkoutUrl]).includes(OFFER_MATCH)
    if (!mine) {
      console.warn('cakto: pedido de outra oferta ignorado', d.offer?.id)
      continue
    }

    if (event === 'purchase_approved') {
      if (d.offer_type && d.offer_type !== 'main') continue // order bump não libera o app
      const email = String(d.customer?.email || '').trim().toLowerCase()
      if (!email) continue
      const { error } = await admin.from('purchases').upsert(
        {
          order_id: d.id,
          ref_id: d.refId ?? null,
          email,
          name: d.customer?.name ?? null,
          phone: digits(d.customer?.phone) || null,
          doc: digits(d.customer?.docNumber) || null,
          status: 'paid',
        },
        { onConflict: 'order_id' }
      )
      if (error) {
        console.error('cakto: erro ao salvar compra', error.message)
        return NextResponse.json({ error: 'db' }, { status: 500 })
      }
    } else if (event === 'refund' || event === 'chargeback') {
      // reembolso ou chargeback: tira o acesso de quem já tinha ativado
      const { data: rows } = await admin
        .from('purchases')
        .update({ status: event === 'refund' ? 'refunded' : 'chargedback' })
        .eq('order_id', d.id)
        .select('claimed_by')
      for (const r of rows || [])
        if (r.claimed_by) await admin.from('profiles').update({ status: 'inactive' }).eq('id', r.claimed_by)
    }
  }
  return NextResponse.json({ ok: true })
}

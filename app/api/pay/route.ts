import { NextResponse } from 'next/server'
import { admin, userFromRequest } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

const AI_PRICE = 59.9
const PLAN_FIRST = 9.9
const PLAN_NEXT = 27.9

async function asaas(path: string, init?: RequestInit) {
  const r = await fetch(`${process.env.ASAAS_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      access_token: process.env.ASAAS_API_KEY!,
      'User-Agent': 'pare-de-fumar-app',
    },
  })
  const text = await r.text()
  let j: any = {}
  try {
    j = JSON.parse(text)
  } catch {
    j = { __raw: text.slice(0, 200) }
  }
  // aparece em Vercel > Logs, para achar o motivo real do erro
  if (!r.ok) console.error('asaas', init?.method || 'GET', path, r.status, text.slice(0, 300))
  return { ...j, __status: r.status }
}

const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')
const errMsg = (j: any, fallback: string) =>
  j?.errors?.[0]?.description || `${fallback} (Asaas ${j?.__status ?? '?'})`

export async function POST(req: Request) {
  const user = await userFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!(await rateLimit(`pay:${user.id}`, 10, 3600)))
    return NextResponse.json({ error: 'Muitas tentativas. Tente de novo em alguns minutos.' }, { status: 429 })

  const body = await req.json()
  const product: 'plan' | 'ai' = body.product === 'ai' ? 'ai' : 'plan'
  const method: 'pix' | 'card' = body.method === 'card' ? 'card' : 'pix'
  if (product === 'plan') return NextResponse.json({ error: 'Plano indisponível.' }, { status: 410 })

  const { data: p } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!p) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // só quem comprou o Método (status ativo) pode assinar a IA
  if (p.status !== 'active')
    return NextResponse.json({ error: 'Acesse o app pela compra do Método primeiro.' }, { status: 403 })
  if (p.ai_active) return NextResponse.json({ error: 'O Companheiro IA já está ativo.' }, { status: 400 })

  // ----- telefone: pedido só na hora de pagar ("salve sua jornada") -----
  let phone: string | null = p.phone
  if (!phone) {
    const d = digits(body.phone)
    if (d.length < 10 || d.length > 13)
      return NextResponse.json({ error: 'Informe um telefone válido para salvar a sua jornada.' }, { status: 400 })
    const { error: phErr } = await admin.from('profiles').update({ phone: d }).eq('id', user.id)
    if (phErr)
      return NextResponse.json({ error: 'Esse telefone já está em outra conta. Fale com o suporte.' }, { status: 409 })
    phone = d
  }

  // ----- cliente no Asaas -----
  const cpf = digits(body.cpf)
  let customerId: string | null = p.asaas_customer_id
  if (!customerId) {
    if (cpf.length !== 11 && cpf.length !== 14)
      return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 })
    const c = await asaas('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: p.name,
        cpfCnpj: cpf,
        mobilePhone: phone,
        externalReference: user.id,
        notificationDisabled: true,
      }),
    })
    if (!c.id) return NextResponse.json({ error: errMsg(c, 'Erro ao criar o cadastro de cobrança.') }, { status: 400 })
    customerId = c.id as string
    await admin.from('profiles').update({ asaas_customer_id: customerId }).eq('id', user.id)
  }

  // ----- valor e assinatura anterior (ainda não paga) -----
  const value = product === 'ai' ? AI_PRICE : p.paid_count === 0 ? PLAN_FIRST : PLAN_NEXT
  const oldSub: string | null = product === 'ai' ? p.ai_subscription_id : p.asaas_subscription_id
  if (oldSub) await asaas(`/subscriptions/${oldSub}`, { method: 'DELETE' })

  const subBody: Record<string, unknown> = {
    customer: customerId,
    value,
    nextDueDate: new Date().toISOString().slice(0, 10),
    cycle: 'MONTHLY',
    description: product === 'ai' ? 'Pare de Fumar - Companheiro IA' : 'Pare de Fumar',
    externalReference: `${product}:${user.id}`,
  }

  if (method === 'pix') {
    subBody.billingType = 'PIX'
  } else {
    const c = body.card || {}
    const h = body.holder || {}
    const num = digits(c.number)
    const ccv = digits(c.ccv)
    const month = digits(c.month).padStart(2, '0')
    const year = digits(c.year).length === 2 ? `20${digits(c.year)}` : digits(c.year)
    const holderCpf = digits(h.cpf) || cpf
    if (num.length < 13 || ccv.length < 3 || !c.name || month.length !== 2 || year.length !== 4)
      return NextResponse.json({ error: 'Confira os dados do cartão.' }, { status: 400 })
    if (!h.email || digits(h.cep).length !== 8 || !h.number || (holderCpf.length !== 11 && holderCpf.length !== 14))
      return NextResponse.json({ error: 'Preencha CPF, e-mail, CEP e número do endereço.' }, { status: 400 })

    subBody.billingType = 'CREDIT_CARD'
    subBody.creditCard = { holderName: String(c.name), number: num, expiryMonth: month, expiryYear: year, ccv }
    subBody.creditCardHolderInfo = {
      name: String(c.name),
      email: String(h.email),
      cpfCnpj: holderCpf,
      postalCode: digits(h.cep),
      addressNumber: String(h.number),
      phone,
    }
    subBody.remoteIp = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim()
  }

  const sub = await asaas('/subscriptions', { method: 'POST', body: JSON.stringify(subBody) })
  if (!sub.id) return NextResponse.json({ error: errMsg(sub, 'Não foi possível criar a cobrança.') }, { status: 400 })

  await admin
    .from('profiles')
    .update(product === 'ai' ? { ai_subscription_id: sub.id } : { asaas_subscription_id: sub.id })
    .eq('id', user.id)

  if (method === 'card') return NextResponse.json({ method: 'card', ok: true })

  // ----- Pix: QR code dentro do app -----
  const pays = await asaas(`/subscriptions/${sub.id}/payments`)
  const payId = pays.data?.[0]?.id
  if (!payId) return NextResponse.json({ error: 'Não foi possível gerar o Pix.' }, { status: 502 })
  const qr = await asaas(`/payments/${payId}/pixQrCode`)
  if (!qr.payload) return NextResponse.json({ error: 'Não foi possível gerar o Pix.' }, { status: 502 })
  return NextResponse.json({ method: 'pix', image: qr.encodedImage, payload: qr.payload })
}

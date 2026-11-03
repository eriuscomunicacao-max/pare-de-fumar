import { timingSafeEqual } from 'crypto'

// comparação de segredos sem vazar informação por tempo de resposta
export function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function clientIp(req: Request) {
  return (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
}

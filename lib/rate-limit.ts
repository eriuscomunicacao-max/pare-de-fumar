import { admin } from './supabase-admin'

// Limite simples por chave (ex.: "signup:IP"). Retorna false quando passou do limite.
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = Date.now()
  const { data } = await admin.from('rate_limits').select('count, reset_at').eq('key', key).maybeSingle()
  if (!data || new Date(data.reset_at).getTime() < now) {
    await admin
      .from('rate_limits')
      .upsert({ key, count: 1, reset_at: new Date(now + windowSec * 1000).toISOString() })
    return true
  }
  if (data.count >= max) return false
  await admin.from('rate_limits').update({ count: data.count + 1 }).eq('key', key)
  return true
}

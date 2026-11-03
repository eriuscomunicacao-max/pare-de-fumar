import { supabase } from './supabase-browser'

export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const r = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token ?? ''}`,
    },
    body: JSON.stringify(body),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Algo deu errado. Tente de novo.')
  return j as T
}

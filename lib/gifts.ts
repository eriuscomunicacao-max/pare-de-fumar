// Presentes (e-books). Para mudar os prazos, mexa só nestas duas linhas.
export const GIFT1_DAYS = 3 // dias depois de criar a conta
export const GIFT2_DAYS = 7 // dias com o plano ativo

export const GIFT1_COVER =
  'https://nlmrmxpgiahegokecksb.supabase.co/storage/v1/object/public/presente/presente2.png'
export const GIFT2_COVER =
  'https://nlmrmxpgiahegokecksb.supabase.co/storage/v1/object/public/presente/presente1.png'

// presente 1: pode baixar quantas vezes quiser
export const GIFT1_URL = 'https://drive.google.com/uc?export=download&id=1GRvUhknAvfjEdDTaREg7JsqtMXKxdp8n'

const DAY = 86400000

type G = {
  status: string
  created_at: string
  activated_at: string | null
}

export const gift1Open = (p: G, now = Date.now()) =>
  p.status === 'active' && now - new Date(p.created_at).getTime() >= GIFT1_DAYS * DAY

export const gift2Open = (p: G, now = Date.now()) =>
  p.status === 'active' && !!p.activated_at && now - new Date(p.activated_at).getTime() >= GIFT2_DAYS * DAY

export const daysLeft = (from: string, days: number, now = Date.now()) =>
  Math.max(0, Math.ceil((new Date(from).getTime() + days * DAY - now) / DAY))

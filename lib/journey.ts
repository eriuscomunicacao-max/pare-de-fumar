export const LEVELS = [
  { name: 'Primeiro Dia', hours: 24, label: '1 dia' },
  { name: 'Aurora', hours: 72, label: '3 dias' },
  { name: 'Fôlego Novo', hours: 168, label: '7 dias' },
  { name: 'Travessia', hours: 336, label: '14 dias' },
  { name: 'Horizonte', hours: 720, label: '30 dias' },
  { name: 'Nova Estrada', hours: 2160, label: '90 dias' },
  { name: 'Vida Livre', hours: 4320, label: '6 meses' },
]

// Um ícone por marco: Partida + 7 níveis = 8 URLs, na ordem da trilha.
// Dica: baixe os arquivos para /public/icons e troque por '/icons/arquivo.webp'
// para o app não depender do servidor deles.
export const ICON_URLS: string[] = [
  'https://app.cakto.com.br/assets/awards/caktos/inicio.webp',
  'https://app.cakto.com.br/assets/awards/caktos/mirage.webp',
  'https://app.cakto.com.br/assets/awards/caktos/oasis.webp',
  'https://app.cakto.com.br/assets/awards/caktos/dune.webp',
  'https://app.cakto.com.br/assets/awards/caktos/solaris.webp',
  'https://app.cakto.com.br/assets/awards/caktos/imperium.webp',
  'https://app.cakto.com.br/assets/awards/caktos/golden-desert.webp',
  'https://app.cakto.com.br/assets/awards/caktos/supreme-sun.webp',
]
export const iconFor = (i: number): string | undefined => ICON_URLS[i] || undefined

// nós do mapa: índice 0 = Partida
export const NODES = [{ name: 'Partida', hours: 0, label: 'Começo' }, ...LEVELS]

export function levelInfo(seconds: number) {
  const h = Math.max(0, seconds) / 3600
  let idx = 0
  NODES.forEach((n, i) => {
    if (h >= n.hours) idx = i
  })
  const current = NODES[idx]
  const next = NODES[idx + 1]
  const progress = next ? (h - current.hours) / (next.hours - current.hours) : 1
  return { idx, current, next, progress: Math.min(1, Math.max(0, progress)) }
}

export function fmtDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  return `${m} min`
}

export function savings(seconds: number, cigsPerDay: number, packPrice: number, cigsPerPack: number) {
  const days = seconds / 86400
  const cigs = Math.floor(days * cigsPerDay)
  const money = (cigs / Math.max(1, cigsPerPack)) * packPrice
  return { cigs, money }
}

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const LEVELS = [
  { name: 'Primeiro Respiro', hours: 1, label: '1 hora' },
  { name: 'Passo Firme', hours: 3, label: '3 horas' },
  { name: 'Novo Ritmo', hours: 6, label: '6 horas' },
  { name: 'Horizonte Aberto', hours: 12, label: '12 horas' },
  { name: 'Primeiro Dia', hours: 24, label: '24 horas' },
  { name: 'Aurora', hours: 72, label: '3 dias' },
  { name: 'Oásis', hours: 168, label: '7 dias' },
  { name: 'Miragem', hours: 336, label: '14 dias' },
  { name: 'Travessia', hours: 720, label: '30 dias' },
  { name: 'Deserto Dourado', hours: 1440, label: '60 dias' },
  { name: 'Novo Caminho', hours: 2160, label: '90 dias' },
  { name: 'Vida Livre', hours: 4320, label: '6 meses' },
]

// Ícones da trilha (URL de cada marco). Ordem: Início + os 12 níveis = 13 URLs.
// Preencha aqui. Enquanto estiver vazio, o app mostra um círculo numerado.
export const ICON_URLS: string[] = [
  // 0 Início
  // 1 Primeiro Respiro
  // 2 Passo Firme
  // 3 Novo Ritmo
  // 4 Horizonte Aberto
  // 5 Primeiro Dia
  // 6 Aurora
  // 7 Oásis
  // 8 Miragem
  // 9 Travessia
  // 10 Deserto Dourado
  // 11 Novo Caminho
  // 12 Vida Livre
]
export const iconFor = (i: number): string | undefined => ICON_URLS[i] || undefined

// nós do mapa: índice 0 = Início
export const NODES = [{ name: 'Início', hours: 0, label: 'Começo' }, ...LEVELS]

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

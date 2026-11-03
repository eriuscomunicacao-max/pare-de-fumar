// Data de hoje no horário de São Paulo (yyyy-mm-dd)
export const todayBR = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

export type Period = 'manha' | 'tarde' | 'noite'

// Período do dia no horário de São Paulo: manhã 5h-12h, tarde 12h-18h, noite 18h-5h
export function periodOf(now = Date.now()): Period {
  const h =
    Number(
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(
        new Date(now)
      )
    ) % 24
  return h >= 5 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite'
}

export const PERIOD_LABEL: Record<Period, string> = {
  manha: 'da manhã',
  tarde: 'da tarde',
  noite: 'da noite',
}

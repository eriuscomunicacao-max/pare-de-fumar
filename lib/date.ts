// Data de hoje no horário de São Paulo (yyyy-mm-dd)
export const todayBR = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

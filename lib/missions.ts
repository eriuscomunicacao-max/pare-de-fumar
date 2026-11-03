import type { Period } from './date'

export type Mission = {
  key: string
  title: string
  subtitle: string
  body: string
  period?: Period // sem período = vale o dia todo
}

export const MISSIONS: Mission[] = [
  // ---- manhã ----
  {
    key: 'cafe',
    period: 'manha',
    title: 'Passar pelo café da manhã sem fumar',
    subtitle: 'Café da manhã sem cigarro',
    body: 'Comece o dia escolhendo o que faz bem para o seu futuro. Se a vontade vier, respire fundo e espere 10 minutos antes de decidir.',
  },
  {
    key: 'aguaacordar',
    period: 'manha',
    title: 'Beber um copo de água ao acordar',
    subtitle: 'Começar o dia cuidando de você',
    body: 'Um copo de água logo cedo é um primeiro passo simples. Beba devagar, em goles pequenos.',
  },
  {
    key: 'saircasa',
    period: 'manha',
    title: 'Sair de casa sem levar cigarros',
    subtitle: 'Deixar o cigarro longe',
    body: 'Deixar o maço em casa tira o cigarro do seu caminho. Se a vontade vier, respire e espere 10 minutos antes de decidir.',
  },
  // ---- tarde ----
  {
    key: 'almoco',
    period: 'tarde',
    title: 'Passar pelo depois do almoço sem fumar',
    subtitle: 'O horário mais difícil para muita gente',
    body: 'Depois de comer a vontade costuma aparecer. Escove os dentes ou dê uma volta curta e deixe ela passar.',
  },
  {
    key: 'caminhada',
    period: 'tarde',
    title: 'Fazer uma caminhada de 10 minutos',
    subtitle: 'Caminhada curta',
    body: 'Mexer o corpo ajuda a vontade a passar. Vá no seu ritmo, sem pressa e sem meta de velocidade.',
  },
  {
    key: 'cafetarde',
    period: 'tarde',
    title: 'Passar pelo café da tarde sem fumar',
    subtitle: 'Café sem cigarro',
    body: 'Se o café lembra o cigarro, mude um detalhe: outro lugar, outra xícara, ou um copo de água junto.',
  },
  // ---- noite ----
  {
    key: 'jantar',
    period: 'noite',
    title: 'Passar pelo depois do jantar sem fumar',
    subtitle: 'Fechar o dia sem cigarro',
    body: 'Depois do jantar a vontade pode voltar. Escove os dentes logo em seguida e ocupe as mãos com alguma coisa.',
  },
  {
    key: 'diarionoite',
    period: 'noite',
    title: 'Escrever no diário o que funcionou hoje',
    subtitle: 'Olhar para o que deu certo',
    body: 'Abra o Diário e escreva uma frase sobre o que ajudou hoje. Perceber o que funciona facilita os próximos dias.',
  },
  {
    key: 'sono',
    period: 'noite',
    title: 'Fazer uma respiração antes de dormir',
    subtitle: 'Acalmar o corpo',
    body: 'Três minutos de respiração lenta ajudam o corpo a desacelerar. Faça deitado ou sentado, sem pressa.',
  },
  // ---- o dia todo ----
  {
    key: 'gatilho',
    title: 'Registrar um gatilho',
    subtitle: 'Perceber o que dá vontade',
    body: 'Conte o que te deu vontade de fumar. Perceber o gatilho é o primeiro passo para vencê-lo.',
  },
  {
    key: 'respiracao',
    title: 'Fazer uma respiração de 3 minutos',
    subtitle: 'Respiração guiada',
    body: 'Três minutos de respiração lenta acalmam o corpo. Faça agora ou deixe para quando a vontade aparecer.',
  },
  {
    key: 'agua',
    title: 'Beber um copo de água devagar',
    subtitle: 'Água gelada, goles pequenos',
    body: 'Beber água devagar ocupa as mãos e a boca. É uma troca simples que funciona bem nos momentos difíceis.',
  },
]

export const getMission = (key: string) => MISSIONS.find(m => m.key === key)

// 2 missões do período atual (variam de um dia para o outro) + o gatilho, que vale o dia todo
export function missionsFor(period: Period, now = Date.now()): Mission[] {
  const pool = MISSIONS.filter(m => m.period === period)
  const day = Math.floor(now / 86400000)
  return [pool[day % pool.length], pool[(day + 1) % pool.length], getMission('gatilho')!]
}

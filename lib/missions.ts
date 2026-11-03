export type Mission = {
  key: string
  title: string
  subtitle: string
  body: string
}

export const MISSIONS: Mission[] = [
  {
    key: 'cafe',
    title: 'Passar pelo café da manhã sem fumar',
    subtitle: 'Café da manhã sem cigarro',
    body: 'Comece o dia escolhendo o que faz bem para o seu futuro. Se a vontade vier, respire fundo e espere 10 minutos antes de decidir.',
  },
  {
    key: 'caminhada',
    title: 'Fazer uma caminhada de 10 minutos',
    subtitle: 'Caminhada curta',
    body: 'Mexer o corpo ajuda a vontade a passar. Vá no seu ritmo, sem pressa e sem meta de velocidade.',
  },
  {
    key: 'gatilho',
    title: 'Registrar um gatilho',
    subtitle: 'Perceber o que dá vontade',
    body: 'Quando sentir vontade, toque em "Estou com vontade agora" e conte o que está acontecendo. Perceber o gatilho é o primeiro passo para vencê-lo.',
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

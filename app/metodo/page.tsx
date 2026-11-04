'use client'

import { useRef, useState } from 'react'
import { ArrowDown, Bell, Lock, Route, ShieldCheck, Wind } from 'lucide-react'
import {
  BANNER_URL,
  CHECKOUT_URL,
  IMG_DOR,
  IMG_HOSPITAL,
  INSIDE,
  PRODUCT_NAME,
  TEST,
  levelOf,
} from '@/lib/metodo'

// imagem que some sozinha se o endereço falhar
function Photo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setOk(false)} />
}

function BuyButton({ enabled, label = 'Quero começar agora' }: { enabled: boolean; label?: string }) {
  return enabled ? (
    <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="btn-gold !py-5 !text-xl">
      {label}
    </a>
  ) : (
    <div className="btn-ghost !py-5 !text-lg opacity-60">
      <Lock size={18} /> Faça o teste para liberar
    </div>
  )
}

export default function Metodo() {
  const [step, setStep] = useState(0)
  const [pts, setPts] = useState<number[]>([])
  const testRef = useRef<HTMLElement>(null)
  const solRef = useRef<HTMLElement>(null)

  const done = pts.length === TEST.length
  const score = pts.reduce((a, b) => a + b, 0)
  const level = levelOf(score)

  function answer(p: number) {
    setPts([...pts.slice(0, step), p])
    if (step < TEST.length - 1) setStep(step + 1)
  }
  function reset() {
    setPts([])
    setStep(0)
  }
  const go = (r: React.RefObject<HTMLElement>) => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className={`min-h-dvh ${done ? 'pb-28' : 'pb-10'}`}>
      {/* 1. PROMESSA */}
      <Photo src={BANNER_URL} alt={PRODUCT_NAME} className="w-full" />
      <header className="space-y-4 px-6 pb-8 pt-8">
        <h1 className="font-serif text-4xl leading-[1.1] text-sand">
          Largue o cigarro sem depender só de força de vontade.
        </h1>
        <p className="text-lg text-sand/85">
          O <b className="text-gold">{PRODUCT_NAME}</b> é um app de acompanhamento para você atravessar cada vontade,
          um passo de cada vez.
        </p>
        <button className="btn-gold" onClick={() => go(testRef)}>
          Fazer o teste de dependência <ArrowDown size={20} />
        </button>
      </header>

      {/* 2. DOR */}
      <section className="space-y-5 px-6 pb-10">
        <Photo src={IMG_DOR} alt="Cigarro na mão" className="w-full rounded-2xl" />
        <h2 className="font-serif text-3xl leading-tight">Você já prometeu que aquele era o último?</h2>
        <ul className="space-y-3 text-lg text-sand/90">
          <li className="panel">Você tenta parar, aguenta alguns dias e a vontade vence.</li>
          <li className="panel">O primeiro cigarro do dia vem antes de qualquer outra coisa.</li>
          <li className="panel">Cada recaída faz você sentir que falhou de novo.</li>
        </ul>
        <p className="text-lg text-sand/90">
          Não é falta de caráter. A nicotina prende o corpo e o hábito prende a rotina. E o preço dessa prisão aparece
          com o tempo.
        </p>
        <div className="space-y-2">
          <Photo src={IMG_HOSPITAL} alt="Pessoa internada em hospital" className="w-full rounded-2xl" />
          <p className="text-center text-sm text-mute">
            O tabaco mata mais de 8 milhões de pessoas por ano. Fonte: Organização Mundial da Saúde (OMS).
          </p>
        </div>
      </section>

      {/* TESTE */}
      <section ref={testRef} className="scroll-mt-4 space-y-4 px-6 pb-10">
        <h2 className="font-serif text-3xl leading-tight text-gold">Calcule a sua dependência do cigarro</h2>
        <p className="text-mute">
          O teste abaixo é usado por médicos do mundo todo. Os fumantes com até 6 pontos têm mais facilidade em largar
          o vício. Quem ultrapassa essa marca pode pensar num tratamento médico.
        </p>

        {!done ? (
          <div className="panel space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-mute">
                Pergunta {step + 1} de {TEST.length}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{ width: `${(step / TEST.length) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xl leading-snug">{TEST[step].q}</p>
            <div className="space-y-2">
              {TEST[step].options.map(([label, p]) => (
                <button key={label} className="chip w-full py-4 text-left text-lg" onClick={() => answer(p)}>
                  {label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button className="text-mute" onClick={() => setStep(step - 1)}>
                Voltar
              </button>
            )}
          </div>
        ) : (
          <div className="panel space-y-3 border-gold/40 bg-gold/10">
            <p className="text-sm text-mute">Seu resultado: {score} pontos</p>
            <p className="font-serif text-3xl text-gold">{level.title}</p>
            <p className="text-lg text-sand/90">{level.text}</p>
            <p className="font-serif text-2xl">Temos a solução para você.</p>
            <button className="btn-gold" onClick={() => go(solRef)}>
              Ver a solução <ArrowDown size={20} />
            </button>
            <button className="w-full py-2 text-sm text-mute" onClick={reset}>
              Refazer o teste
            </button>
          </div>
        )}
      </section>

      {/* 3. SOLUÇÃO */}
      <section ref={solRef} className="scroll-mt-4 space-y-4 px-6 pb-10">
        <h2 className="font-serif text-3xl leading-tight">A solução: {PRODUCT_NAME} + app de acompanhamento</h2>
        <p className="text-lg text-sand/90">
          Um método prático para entender o seu hábito e seguir um plano, e um app que fica com você na hora em que a
          vontade aparece.
        </p>
        {[
          {
            Icon: ShieldCheck,
            title: 'Siga o método no seu ritmo',
            text: 'Um material prático, passo a passo, para você montar o seu plano.',
          },
          {
            Icon: Wind,
            title: 'Use o botão "Estou com vontade"',
            text: 'Respiração guiada de 3 minutos e ações simples até a vontade passar.',
          },
          {
            Icon: Route,
            title: 'Acompanhe a sua evolução',
            text: 'Trilha com conquistas, quanto você já economizou e o tempo sem fumar.',
          },
          {
            Icon: Bell,
            title: 'Lembretes na hora certa',
            text: 'Frases de apoio nos horários em que a vontade costuma aparecer.',
          },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="panel flex items-start gap-4">
            <Icon className="mt-0.5 shrink-0 text-gold" size={28} strokeWidth={1.7} />
            <div>
              <p className="text-lg font-medium leading-snug">{title}</p>
              <p className="mt-1 text-mute">{text}</p>
            </div>
          </div>
        ))}
        <p className="text-lg text-sand/90">
          Depois da compra, você recebe acesso ao <b>app de acompanhamento</b>, com o <b>Companheiro IA</b> disponível
          para quem quiser apoio extra nos momentos difíceis.
        </p>
      </section>

      {/* 4. PROVA */}
      <section className="space-y-4 px-6 pb-10">
        <h2 className="font-serif text-3xl leading-tight">Por que isso importa</h2>
        <div className="panel space-y-2">
          <p className="text-lg">
            Mais de 60% das pessoas que usam tabaco querem parar, mas cerca de 70% não têm acesso a ajuda.
          </p>
          <p className="text-sm text-mute">Fonte: Organização Mundial da Saúde (OMS).</p>
        </div>
        {INSIDE.length > 0 && (
          <div className="panel space-y-2">
            <p className="font-serif text-2xl">O que você vai encontrar</p>
            <ul className="list-disc space-y-1 pl-5 text-sand/90">
              {INSIDE.map(i => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="panel flex items-start gap-4 border-gold/40">
          <ShieldCheck className="mt-0.5 shrink-0 text-gold" size={28} strokeWidth={1.7} />
          <div>
            <p className="text-lg font-medium">Garantia de 7 dias</p>
            <p className="mt-1 text-mute">
              Se não fizer sentido para você, peça o reembolso em até 7 dias depois da compra.
            </p>
          </div>
        </div>
      </section>

      {/* 5. AÇÃO */}
      <section className="space-y-4 px-6 pb-8">
        <h2 className="font-serif text-3xl leading-tight">Comece hoje. A próxima vontade já tem ajuda.</h2>
        <BuyButton enabled={done} />
        <p className="text-center text-sm text-mute">Compra segura pela Cakto.</p>
      </section>

      <p className="px-6 text-center text-xs leading-relaxed text-mute">
        Este material e o app não substituem acompanhamento médico. O SUS oferece tratamento gratuito contra o
        tabagismo.
      </p>

      {/* botão fixo depois do teste */}
      {done && (
        <div className="fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-md bg-gradient-to-t from-ink via-ink/95 to-transparent px-6 pb-[max(env(safe-area-inset-bottom),16px)] pt-8">
            <BuyButton enabled label="Quero começar agora" />
          </div>
        </div>
      )}
    </main>
  )
}

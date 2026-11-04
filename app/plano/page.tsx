import { redirect } from 'next/navigation'

// o plano antigo (teste de 24h + mensalidade) acabou: quem chega aqui vai para o acesso do Método
export default function Plano() {
  redirect('/acesso')
}

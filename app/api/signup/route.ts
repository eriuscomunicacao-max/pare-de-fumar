import { NextResponse } from 'next/server'

// O cadastro com teste grátis foi encerrado. O acesso agora é pela compra do Método (/api/acesso).
export async function POST() {
  return NextResponse.json({ error: 'Cadastro encerrado. Acesse pela compra do Método.' }, { status: 410 })
}

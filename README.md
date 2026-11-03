# Pare de Fumar

App PWA para parar de fumar. Next.js 14 + Supabase + Asaas + Web Push + Claude.

## Rodar

1. `cp .env.example .env.local` e preencha as variáveis.
2. Rode o SQL no Supabase (SQL Editor).
3. `npm install && npm run dev`

## Chaves VAPID

`npx web-push generate-vapid-keys`

## Asaas

Webhook: `https://SEU-DOMINIO/api/webhooks/asaas` com o mesmo token de `ASAAS_WEBHOOK_TOKEN`.
Eventos: cobranças e assinaturas.

## Notificações

`vercel.json` chama `/api/cron/notify` de hora em hora (plano Pro da Vercel).
Na Vercel, defina `CRON_SECRET`: ela envia `Authorization: Bearer <CRON_SECRET>` nas chamadas do cron.

## Ícones da trilha

Edite `ICON_URLS` em `lib/journey.ts` (13 URLs: Início + 12 níveis).

## Planos

- Pare de Fumar: R$ 9,90 no 1º mês, depois R$ 27,90 (Pix ou cartão, dentro do app).
- Companheiro IA: R$ 59,90/mês (assinatura separada). Limite diário em `AI_DAILY_LIMIT`.

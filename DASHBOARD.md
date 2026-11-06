# Painel /dashboard — Cometa

Mesmo modelo dos painéis da Nova Ferragista, Construbloc e Sólida, adaptado para um site com 7 páginas de serviço.

```
Página ──dataLayer──▶ GTM-MNJ3NB86 ──▶ GA4 G-Z5FPTWB38Y (eventos) + Google Ads AW-963034156 (conversões)
   └──coCollect──▶ /js/tracker.js ──▶ /api/collect ──▶ Supabase (cometa_sessions / cometa_events)
/dashboard (senha) ──▶ /api/dashboard (Supabase) + /api/google-ads (API, via MCC) + /api/ga4 (Data API)
```

## Onde está cada coisa

| Caminho | O quê |
|---|---|
| `painel/js/tracker.js` | coletor anônimo (sem IP nem cookie; sessão em sessionStorage, visitante em localStorage) |
| `painel/dashboard/` | painel (HTML + `app.js`); o build copia para `producao/dashboard` |
| `api/collect.js` | recebe os lotes do coletor e grava no Supabase |
| `api/dashboard.js`, `api/_lib/report.js` | relatório do período; `SECTIONS` = seções de cada página, na ordem |
| `api/_lib/payload.js` | validação do lote; `PAGE_TYPES` = páginas aceitas |
| `api/google-ads.js`, `api/ga4.js` | leitura (só consulta) do Google Ads e do GA4 |
| `api/login.js`, `api/_lib/auth.js` | senha única → token assinado |
| `supabase/migrations/0001_cometa_analytics.sql` | tabelas `cometa_sessions`, `cometa_events` e a função `cometa_upsert_session` |
| `tests/` | `npm test` (85 testes, sem rede) |

## Banco (Supabase)

Projeto compartilhado `khipnjfbxjgvmjvyxero`, o mesmo da Sólida, Gaspar, LM Tubos, Construbloc e Nova Ferragista. A separação é só pelo prefixo `cometa_`.
Para criar as tabelas, abra o SQL Editor do projeto, cole o arquivo `supabase/migrations/0001_cometa_analytics.sql` e rode. O arquivo é idempotente, então rodar de novo não apaga nada.
RLS fica ligado sem policies: só a service role (API na Vercel) lê e escreve.
**Nunca** rodar `drop`/`delete` sem o prefixo `cometa_`.

## Variáveis na Vercel (projeto `cometa-goiania` → Settings → Environment Variables → Production)

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://khipnjfbxjgvmjvyxero.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | a mesma dos outros painéis (`.env.local` da Construbloc) |
| `DASHBOARD_PASSWORD` | senha nova do cliente (mín. 8) |
| `DASHBOARD_SECRET` | texto aleatório (mín. 16) |
| `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN` | os mesmos dos outros painéis |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | `603-989-2603` (MCC da M\|P) |
| `GOOGLE_ADS_CUSTOMER_ID` | `2206428887` (Cometa Dedetizadora) |
| `GA4_PROPERTY_ID` | ID numérico da propriedade do G-Z5FPTWB38Y (GA4 → Administrador → Detalhes da propriedade) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da conta de serviço `dashboard-ga4@` (o mesmo dos outros painéis) |

A conta de serviço precisa ser **Leitor** no GA4 da Cometa. Depois de criar ou trocar qualquer variável, faça um **redeploy**, porque a variável só vale a partir dele.

## Erros conhecidos

| Sintoma | Causa |
|---|---|
| "Dashboard não configurado" no login | faltou redeploy, ou senha < 8 / segredo < 16 |
| Google Ads mostra a conta da M\|P | `GOOGLE_ADS_CUSTOMER_ID` errado (tem que ser 2206428887) |
| GA4 "use o ID numérico" | colocaram `G-Z5FPTWB38Y` no `GA4_PROPERTY_ID` |
| GA4 "sem acesso à propriedade" | conta de serviço não é Leitor |
| Coleta não grava | faltam as variáveis do Supabase ou as tabelas `cometa_*` (o collect responde 204 mesmo assim, de propósito) |

## Como o funil e os botões são nomeados

- Página = `page_type` (enviado no `<head>` de cada página pelo `build/build.js`).
- Seção = `data-secao` da seção (`prototipo/index.html`). A primeira dobra de cada página é `topo`.
- Botão = `cta_id` = tipo + lugar (`cta_whatsapp_empresas`, `tel_barra`, `maps_rodape`). O painel traduz para "WhatsApp · Empresas e condomínios".
- Os nomes legíveis estão em `painel/dashboard/app.js` (`PAGE`, `SECTION`, `CTA`) e em `api/_lib/report.js` (`SECTION_LABEL`).

## Teste local

```bash
cd build && node build.js && cd ..
PORT=4199 node scripts/dev-server.mjs     # lê .env.local, se existir
```
O coletor se desliga com `navigator.webdriver` ou UA "Headless" (anti-bot). Num Playwright, use UA de iPhone e `webdriver=false`.

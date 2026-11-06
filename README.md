# Cometa Desentupidora e Dedetizadora (unidade Goiânia)

Resumo do cliente para quem for mexer nesta pasta (Rudah, Pedro, Marcos). Sem senhas aqui.

## O cliente
- Franquia Cometa (sede SP), unidade Goiânia desde 1995. Marca com mais de 40 anos.
- CNPJ: 00.648.783/0001-14
- Endereço: R. 115, Qd. F36, Lt. 58, nº 468, Setor Sul, Goiânia-GO, CEP 74085-240
- WhatsApp e telefone: (62) 3241-3001
- Horário: seg a sex 9h às 18h, sáb 9h às 14h. **Não é 24h** (anúncios usam "24h" por CTR, com programação só no horário de atendimento).
- Carro-chefe: desentupimento (margem ~25%). Dedetização tem margem baixa (~5%).
- Ticket médio: desentupimento R$ 500 (PF) / R$ 2.000 (PJ). Cliente ideal: empresas.
- Clientes conhecidos: Ambev, Bradesco, Cargill, Marajoara, Hospital de Olhos de Goiânia, JBS, Cosmed, Infraero.

## Área de atendimento
Goiânia, Aparecida de Goiânia, Senador Canedo, Abadia de Goiás, Trindade, Santo Antônio de Goiás, Goianira, Terezópolis, Caldazinha, Bonfinópolis, Hidrolândia, Nerópolis, Aragoiânia, Goianápolis e Guapó.
Até 40 km sem custo de deslocamento. Acima disso (ex.: Anápolis) só indústria ou grande volume, então negativar Anápolis no residencial.

## Site novo
- Provisório: https://cometa-goiania.vercel.app (Vercel Hobby, conta da MP, projeto `cometa-goiania`)
- Apresentado ao cliente em 04/11/2026, aprovado sem alterações.
- Domínio oficial: cometadedetizadora.com.br (hoje WordPress na Hostinger do cliente).

| Serviço | URL |
|---|---|
| Home | / |
| Desentupimento | /desentupidora-goiania |
| Limpa fossa | /limpa-fossa-goiania |
| Caixa de gordura | /limpeza-caixa-de-gordura |
| Hidrojateamento | /hidrojateamento-goiania |
| Caixa d'água | /limpeza-caixa-dagua-goiania |
| Dedetização | /dedetizacao-goiania |

Cada página manda uma mensagem própria no WhatsApp ("Olá! Vim pelo site e preciso de limpa fossa.", com variações "para empresa"), para separar os leads por serviço no CRM.

### Como editar e publicar
1. Editar `prototipo/index.html` (é a fonte de tudo). O painel fica em `painel/` (`dashboard/` e `js/tracker.js`).
2. Gerar a versão final: `cd build && node build.js` (gera `producao/`, já com o painel copiado).
3. Testes do painel: `npm test` na raiz.
4. Publicar **da raiz do repositório** (não mais de dentro de `producao`, porque as funções do painel ficam em `api/`):
   `npx --yes vercel@48.2.0 deploy --prod --yes --scope mppartnersprincipal-6278s-projects`
   (a raiz já está ligada ao projeto `cometa-goiania`; numa máquina nova, rodar antes `npx --yes vercel@48.2.0 link --yes --project cometa-goiania --scope mppartnersprincipal-6278s-projects`)
5. Salvar no GitHub (repositório privado mppartnersprincipal-svg/site-cometa-detetizadora): `git add -A`, `git commit -m "..."` e `git push`.

## Rastreamento
- **GTM:** `GTM-MNJ3NB86` (o mesmo do WordPress antigo). **GA4:** `G-Z5FPTWB38Y`. **Google Ads:** conta 220-642-8887, tag `AW-963034156`.
- Tudo passa pelo GTM: nada de `gtag`/pixel direto no HTML (contaria em dobro). O código fica em `build/build.js` (`RASTREAMENTO`, `headRastreio`, `noscriptGtm`).
- O JSON de importação está em `gtm/GTM-MNJ3NB86-importar.json`. Ele **não** cria Google Tag, vinculador de conversões nem a conversão de WhatsApp, porque o contêiner já tem os três (ver "Conversões").
- **GA4 e o `page_view` (versão 41 do GTM, 06/11/2026):** o ID G-Z5FPTWB38Y não é uma "tag do Google" própria: ele está agrupado na tag do Google AW-708138840 (outra conta de Ads, que não é da Cometa), e `gtag/js?id=G-Z5FPTWB38Y` responde 404. Por isso a tag "GA4 - G-Z5FPTWB38Y" do GTM não envia nada sozinha. O `page_view` vai pela tag **"GA4 - page_view (G-Z5FPTWB38Y)"** (evento GA4, Initialization - All Pages), e os outros eventos pela "GA4 - Evento - Eventos da LP". **Não** usar AW-708138840 como ID de tag. O GA4 G-8328NK3ZXG (sem acesso da MP) recebe `page_view` pela tag do Google Ads AW-963034156.
- GA4 "GA4 - Cometa" (propriedade 491068658): retenção de 14 meses, "interações com formulário" desligado e dimensões personalizadas de evento `cta_id`, `page_type`, `section_id` e `faq_question`.
- Cada página envia `page_type` antes do GTM: `inicio`, `desentupimento`, `limpa-fossa`, `caixa-de-gordura`, `hidrojato`, `caixa-dagua`, `dedetizacao` (+ `privacidade`, `erro404`).

| Evento (dataLayer → GA4) | Quando | Parâmetros |
|---|---|---|
| `click_whatsapp` | clique em qualquer `.zap-link` | `cta_id` |
| `click_phone` | clique em `.tel-link` | `cta_id` |
| `click_maps` | "Ver no mapa" do rodapé | `cta_id` |
| `click_cta` | links com `data-cta-id` ("Ver serviços" da home) | `cta_id` |
| `faq_open` | pergunta aberta | `faq_question` |
| `scroll_25/50/75/100` | profundidade de rolagem, 1x por página | `percent_scrolled` |
| `section_view` | seção cruzou o meio da tela, 1x por seção | `section_id` |

Todos levam `page_type` e os UTMs da entrada (`utm_source/medium/campaign/term/content`).

**`cta_id`** é montado pelo lugar do clique: `cta_whatsapp_<lugar>`, `tel_<lugar>`, `maps_<lugar>`. Lugares fixos: `header`, `flutuante`, `barra` (barra do celular), `rodape`; dentro das páginas vale o `data-secao` da seção. Para dar um nome fixo a um botão, use `data-cta="..."` nele.

**`data-secao`** (em cada `<section>` do protótipo e no `.hero`): `topo` (primeira dobra), `servicos`, `numeros`, `empresas`, `equipe`, `avaliacoes`, `duvidas`, `quando`, `como`, `oque`, `antes-depois`, `outros` (serviços que combinam), `area`, `final`. Seção nova precisa de `data-secao`. Se for de uma página de serviço, também precisa entrar em `api/_lib/report.js → SECTIONS`, na ordem da página.

### Conversões (Google Ads)
| Conversão | Origem | Tipo |
|---|---|---|
| Entrou em contato Whatsapp | tag antiga do GTM, acionada por clique em link `wa.me` (vale para o WordPress e para o site novo) | principal |
| Clique no telefone (site) | tag nova `Google Ads - Conversão - Clique no telefone (site)`, evento `click_phone` (`AW-963034156/1aT9CIvPsLMdEKz4mssD`) | secundária (fora do lance) |
| Calls from ads / Lead Telefônico - Anúncio | ligação pelo anúncio | principal |

Não criar uma segunda tag de conversão de WhatsApp ligada a `click_whatsapp` enquanto a tag antiga de `wa.me` estiver ativa: o mesmo clique contaria duas vezes.

## Painel (/dashboard)
Painel com senha em `/dashboard`: visitas, contatos por botão e por página de serviço, funil de leitura de cada página, jornadas, campanhas/UTMs, Google Ads e GA4. Como funciona, variáveis e banco: [DASHBOARD.md](DASHBOARD.md).

## Campanhas
- Google Ads: [MP][LEAD][PESQUISA][DESENTUPIMENTO] e [MP][LEAD][PESQUISA][CAIXA D'ÁGUA] (só caixa d'água desde 26/10/2026).
- CRM: o cliente não marca perdidos nem faz follow-up (out/2026 com ~200 negócios em aberto).

## Pendências
- [x] GTM instalado no site (GTM-MNJ3NB86, 06/11/2026)
- [x] JSON do GTM importado e publicado; `page_view` do GA4 corrigido (versão 41, 06/11/2026)
- [x] Tabelas `cometa_*` no Supabase e variáveis do painel na Vercel (06/11/2026)
- [ ] GA4: marcar `click_whatsapp` como evento principal (Administrador → Eventos → estrela), quando ele aparecer na lista. Ele só é disparado pelo site novo, então aparece depois do primeiro clique real
- [ ] Apagar a visita de teste: `delete from cometa_sessions where utm_content = 'qa-seed';`
- [ ] Instalar MCP do Google Ads nesta máquina (pegar config com o Pedro)
- [ ] Domínio: pedir código de acesso da Hostinger ao cliente e perguntar se usam e-mail @cometadedetizadora.com.br
- [ ] Na troca do domínio: manter MX do e-mail, redirecionar (301) URLs antigas do WordPress, **remover o `X-Robots-Tag: noindex` do vercel.json**
- [ ] Google Search Console + envio do sitemap
- [x] Conversão "Clique no telefone (site)" criada como secundária (06/11/2026). WhatsApp segue na conversão antiga "Entrou em contato Whatsapp"
- [ ] Trocar URLs finais dos anúncios para a página de cada serviço (depois do domínio)
- [ ] Confirmar CPA de referência com o cliente
- [ ] Ver com o cliente se fazem desratização, descupinização e vídeo inspeção (possíveis páginas novas)
- [ ] Fotos reais de desentupimento, fossa e caixa de gordura (hoje algumas são geradas por IA)

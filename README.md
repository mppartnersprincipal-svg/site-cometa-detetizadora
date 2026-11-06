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
Eventos no dataLayer: `clique_whatsapp` e `clique_telefone`.

### Como editar e publicar
1. Editar `site/prototipo/index.html` (é a fonte de tudo).
2. Gerar a versão final: `cd site/build && node build.js` (gera `site/producao`).
3. Publicar: dentro de `site/producao`, rodar
   `npx --yes vercel@48.2.0 deploy --prod --yes --name cometa-goiania --scope mppartnersprincipal-6278s-projects`
4. Salvar no GitHub (repositório privado mppartnersprincipal-svg/site-cometa-detetizadora, pasta `site`): `git add -A`, `git commit -m "..."` e `git push`.

## Campanhas
- Google Ads: [MP][LEAD][PESQUISA][DESENTUPIMENTO] e [MP][LEAD][PESQUISA][CAIXA D'ÁGUA] (só caixa d'água desde 26/10/2026).
- CRM: o cliente não marca perdidos nem faz follow-up (out/2026 com ~200 negócios em aberto).

## Pendências
- [ ] Criar GTM (conta da MP) e instalar no site
- [ ] Instalar MCP do Google Ads nesta máquina (pegar config com o Pedro)
- [ ] Domínio: pedir código de acesso da Hostinger ao cliente e perguntar se usam e-mail @cometadedetizadora.com.br
- [ ] Na troca do domínio: manter MX do e-mail, redirecionar (301) URLs antigas do WordPress, **remover o `X-Robots-Tag: noindex` do vercel.json**
- [ ] Google Search Console + envio do sitemap
- [ ] Criar conversões no Google Ads a partir dos cliques de WhatsApp e telefone
- [ ] Trocar URLs finais dos anúncios para a página de cada serviço (depois do domínio)
- [ ] Confirmar CPA de referência com o cliente
- [ ] Ver com o cliente se fazem desratização, descupinização e vídeo inspeção (possíveis páginas novas)
- [ ] Fotos reais de desentupimento, fossa e caixa de gordura (hoje algumas são geradas por IA)

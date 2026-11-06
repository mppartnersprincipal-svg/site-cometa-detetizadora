// Gera o site de produção (uma página HTML por serviço) a partir do protótipo.
// Uso: node build.js            -> gera ../producao
// O protótipo (../prototipo/index.html) continua sendo a fonte: ajuste lá e rode de novo.
const fs = require("fs"), path = require("path");

const SRC = path.join(__dirname, "../prototipo");
const OUT = path.join(__dirname, "../producao");
const DOMINIO = "https://cometadedetizadora.com.br";
const proto = fs.readFileSync(path.join(SRC, "index.html"), "utf8");

// visão do protótipo -> endereço da página
const PAGINAS = {
  "inicio": "",
  "desentupimento": "desentupidora-goiania",
  "limpa-fossa": "limpa-fossa-goiania",
  "caixa-de-gordura": "limpeza-caixa-de-gordura",
  "hidrojato": "hidrojateamento-goiania",
  "caixa-dagua": "limpeza-caixa-dagua-goiania",
  "dedetizacao": "dedetizacao-goiania"
};
const NOME = {"desentupimento":"Desentupimento","limpa-fossa":"Limpa fossa","caixa-de-gordura":"Limpeza de caixa de gordura","hidrojato":"Hidrojateamento","caixa-dagua":"Limpeza de caixa d'água","dedetizacao":"Dedetização"};
const CIDADES = ["Goiânia","Aparecida de Goiânia","Senador Canedo","Trindade","Goianira","Abadia de Goiás","Santo Antônio de Goiás","Terezópolis de Goiás","Caldazinha","Bonfinópolis","Hidrolândia","Nerópolis","Aragoiânia","Goianápolis","Guapó"];
const url = v => DOMINIO + "/" + PAGINAS[v];

// ---------- peças do protótipo ----------
const pega = (re, nome) => { const m = proto.match(re); if (!m) throw new Error("não achei: " + nome); return m[1]; };
const css = pega(/<style>([\s\S]*?)<\/style>/, "style");
const sprite = pega(/(<svg width="0"[\s\S]*?\n<\/svg>)/, "sprite");
const header = pega(/(<header class="topo">[\s\S]*?<\/header>)/, "header");
const depoisMain = pega(/<\/main>([\s\S]*?)<script>/, "rodapé");
const ldEmpresa = JSON.parse(pega(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, "ld empresa"));
const scriptProto = pega(/<script>\s*\(function\(\)\{([\s\S]*?)<\/script>/, "script");
const objeto = (nome) => Function("return " + scriptProto.match(new RegExp("var " + nome + " = (\\{[\\s\\S]*?\\n  \\});"))[1])();
const MSG = objeto("MSG"), SEO = objeto("SEO");
MSG["desentupimento-empresa"] = scriptProto.match(/MSG\["desentupimento-empresa"\] = "([^"]+)"/)[1];
MSG["gordura-empresa"] = scriptProto.match(/MSG\["gordura-empresa"\] = "([^"]+)"/)[1];
const AUTO = Function("return " + scriptProto.match(/var AUTO = (\{[^}]+\});/)[1])();
const NUMERO = scriptProto.match(/var NUMERO = "(\d+)"/)[1];

// ---------- rastreamento ----------
// Tudo pelo GTM (GA4 G-Z5FPTWB38Y + conversões do Google Ads ficam no contêiner; JSON de importação em gtm/).
// Nada de gtag/pixel direto no HTML: contaria em dobro. Os cliques também vão para o coletor do
// /dashboard (painel/js/tracker.js → window.coCollect). Eventos e cta_id: README.md → Rastreamento.
const GTM_ID = "GTM-MNJ3NB86";
// page_type de cada página (mesmos nomes de api/_lib/payload.js → PAGE_TYPES)
const headRastreio = pt => `<script>window.dataLayer=window.dataLayer||[];dataLayer.push({page_type:"${pt}"});</script>
<script src="/js/tracker.js" defer></script>`;
const noscriptGtm = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
const RASTREAMENTO = `
  // ---- rastreamento: dataLayer (GTM) + coletor do /dashboard ----
  // Eventos: click_whatsapp · click_phone · click_maps · click_cta (com cta_id) · faq_open
  // · scroll_25/50/75/100 · section_view (section_id = data-secao). page_type e UTMs seguem em todos.
  var dl = window.dataLayer = window.dataLayer || [];
  var PT = (dl.filter(function(x){ return x && x.page_type; })[0] || {}).page_type || "inicio";
  var UTM_KEYS = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
  // zera parâmetros a cada evento: o dataLayer do GTM guarda o último valor
  var RESET = { cta_id: undefined, section_id: undefined, percent_scrolled: undefined, faq_question: undefined };
  var COLLECT = { click_whatsapp: "whatsapp_click", click_phone: "phone_click", click_cta: "cta_click", click_maps: "cta_click", faq_open: "faq_open" };
  var utms = {};
  try {
    var qs = new URLSearchParams(location.search), daUrl = {};
    UTM_KEYS.forEach(function(k){ var x = qs.get(k); if (x) daUrl[k] = x.slice(0, 100); });
    if (Object.keys(daUrl).length) sessionStorage.setItem("co_utms", JSON.stringify(daUrl));
    utms = JSON.parse(sessionStorage.getItem("co_utms") || "{}");
  } catch (e) { utms = {}; }
  function track(nome, params){
    dl.push(Object.assign({ event: nome, page_type: PT }, RESET, utms, params || {}));
    if (!COLLECT[nome] || !window.coCollect) return;
    window.coCollect(COLLECT[nome], nome === "faq_open" ? params : { cta_location: params.cta_id });
  }
  // onde o clique aconteceu: botões fixos, topo, rodapé ou data-secao da seção
  function lugar(el){
    if (el.closest(".zap-flutuante")) return "flutuante";
    if (el.closest(".barra-cel")) return "barra";
    if (el.closest(".topo")) return "header";
    if (el.closest(".rodape")) return "rodape";
    var s = el.closest("[data-secao]"); return s ? s.dataset.secao : "conteudo";
  }

  // GTM carrega depois da página, para não pesar na abertura
  dl.push({ "gtm.start": Date.now(), event: "gtm.js" });
  window.addEventListener("load", function(){ setTimeout(function(){
    var g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtm.js?id=${GTM_ID}"; document.head.appendChild(g);
  }, 0); });

  document.addEventListener("click", function(ev){
    var a = ev.target.closest("a"); if (!a) return;
    if (a.classList.contains("zap-link")) return track("click_whatsapp", { cta_id: a.dataset.cta || "cta_whatsapp_" + lugar(a) });
    if (a.classList.contains("tel-link")) return track("click_phone", { cta_id: "tel_" + lugar(a) });
    if (/google\\.[a-z.]+\\/maps/.test(a.href)) return track("click_maps", { cta_id: "maps_" + lugar(a) });
    if (a.dataset.ctaId) track("click_cta", { cta_id: a.dataset.ctaId });
  });

  // FAQ: pergunta aberta (o clique acontece antes de o <details> abrir)
  document.querySelectorAll(".faq summary").forEach(function(s){ s.addEventListener("click", function(){
    if (!s.parentElement.open) track("faq_open", { faq_question: s.textContent.replace(/\\s+/g, " ").trim().slice(0, 120) });
  }); });

  // rolagem: cada marca dispara uma vez por página
  var marcas = {}, rolando = false;
  function confere(){
    var h = document.documentElement.scrollHeight - innerHeight, pct = h > 0 ? scrollY / h * 100 : 100;
    [25, 50, 75, 100].forEach(function(m){ if (!marcas[m] && pct >= m - 1) { marcas[m] = true; track("scroll_" + m, { percent_scrolled: m }); } });
    rolando = false;
  }
  window.addEventListener("scroll", function(){ if (!rolando) { rolando = true; requestAnimationFrame(confere); } }, { passive: true });

  // seção vista: quando cruza o meio da tela, uma vez por seção
  if (temIO) { var sio = new IntersectionObserver(function(es){ es.forEach(function(e){
    if (!e.isIntersecting) return; sio.unobserve(e.target); track("section_view", { section_id: e.target.dataset.secao });
  }); }, { rootMargin: "0px 0px -50% 0px" }); document.querySelectorAll("[data-secao]").forEach(function(el){ sio.observe(el); }); }`;

const views = {};
proto.replace(/<section data-view="([\w-]+)"[^>]*>([\s\S]*?)\n<\/section>/g, (m, v, corpo) => { views[v] = corpo; });
if (Object.keys(views).length !== 7) throw new Error("esperava 7 páginas, achei " + Object.keys(views).length);

// ---------- utilidades ----------
const semTags = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function trocaLinks(html, atual) {
  return html
    .replace(/href="#inicio-servicos"/g, 'href="/#inicio-servicos"')
    .replace(/href="#([\w-]+)"/g, (m, id) => {
      if (id === "inicio") return 'href="/"';
      if (id in PAGINAS) return `href="/${PAGINAS[id]}"`;
      return m; // âncoras da própria página (#area-atendimento, ícones #i-*)
    });
}

// caminhos relativos -> absolutos, para funcionar em /limpa-fossa-goiania e em qualquer subpasta
const absolutos = html => html.replace(/(src|srcset|poster)="((?:img|video)\/)/g, '$1="/$2').replace(/, img\//g, ", /img/");

function heroComPrioridade(corpo) {
  // a primeira foto do topo é o LCP: sem lazy e com prioridade alta
  let preload = "";
  const novo = corpo.replace(/(<div class="hero">[\s\S]*?)<img ([^>]*)>/, (m, antes, attrs) => {
    const src = attrs.match(/src="([^"]+)"/)[1];
    const srcset = (attrs.match(/srcset="([^"]+)"/) || [])[1];
    const sizes = (attrs.match(/sizes="([^"]+)"/) || [])[1];
    preload = `<link rel="preload" as="image" href="/${src}"` + (srcset ? ` imagesrcset="${srcset.replace(/img\//g, "/img/")}" imagesizes="${sizes}"` : "") + ` fetchpriority="high">`;
    attrs = attrs.replace(/ loading="lazy"/, "").replace(/ fetchpriority="high"/, "");
    return `${antes}<img ${attrs.replace(/ decoding="async"/, "")} fetchpriority="high" decoding="async">`;
  });
  return { corpo: novo, preload };
}

function ldPagina(v, corpo) {
  const grafo = [];
  const trilha = [{"@type":"ListItem","position":1,"name":"Início","item":DOMINIO + "/"}];
  if (NOME[v]) {
    trilha.push({"@type":"ListItem","position":2,"name":NOME[v],"item":url(v)});
    const lead = (corpo.match(/<p class="lead">([\s\S]*?)<\/p>/) || [, ""])[1];
    grafo.push({"@type":"Service","name":NOME[v] + " em Goiânia","serviceType":NOME[v],"url":url(v),
      "provider":{"@id":DOMINIO + "/#empresa"},"areaServed":CIDADES.map(c => ({"@type":"City","name":c})),"description":semTags(lead)});
  }
  grafo.push({"@type":"BreadcrumbList","itemListElement":trilha});
  const faq = [...corpo.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  if (faq.length) grafo.push({"@type":"FAQPage","mainEntity":faq.map(f => ({"@type":"Question","name":semTags(f[1]),"acceptedAnswer":{"@type":"Answer","text":semTags(f[2])}}))});
  return {"@context":"https://schema.org","@graph":grafo};
}

const empresa = Object.assign({}, ldEmpresa, {"@id": DOMINIO + "/#empresa", "url": DOMINIO + "/", "logo": DOMINIO + "/img/logo.webp", "image": DOMINIO + "/img/desentupindo-quintal.webp"});

function script(v) {
  return `<script>
(function(){
  var NUMERO = "${NUMERO}";
  var MSG = ${JSON.stringify(MSG)};
  var PAGINA = "${v}", PADRAO = "${AUTO[v]}";
  document.querySelectorAll(".zap-link").forEach(function(a){
    var chave = a.dataset.msg === "auto" ? PADRAO : a.dataset.msg;
    a.href = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(MSG[chave] || MSG.geral);
  });
  var parado = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temIO = "IntersectionObserver" in window;

  // vídeos: tocam sem som só quando aparecem na tela
  var vids = document.querySelectorAll("video");
  if (parado || !temIO) vids.forEach(function(x){ x.controls = true; });
  else { var vio = new IntersectionObserver(function(es){ es.forEach(function(e){
    if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function(){ e.target.controls = true; }); } else e.target.pause(); }); }, {threshold:.35});
    vids.forEach(function(x){ vio.observe(x); }); }

  // revelar ao rolar
  if (!parado && temIO) {
    var SEL = ".titulo-secao,.card,.passos li,.aval,.galeria figure,.faq details,.pragas div,.sinais > img,.sinais > video,.empresas .wrap > img,.marcas span,.cidades li,.antes-depois figure,.videos figure,.numeros > div,.tambem,.confianca .wrap > div";
    var rio = new IntersectionObserver(function(es){ es.forEach(function(e){
      if (!e.isIntersecting) return; var el = e.target; el.classList.add("visto"); rio.unobserve(el);
      setTimeout(function(){ el.classList.remove("revela","visto"); el.style.removeProperty("--atraso"); }, 700 + (parseInt(el.style.getPropertyValue("--atraso")) || 0));
    }); }, {rootMargin:"0px 0px -8% 0px", threshold:.08});
    document.documentElement.classList.add("js");
    document.querySelectorAll(SEL).forEach(function(el){
      if (el.closest(".hero")) return;
      var irmaos = Array.prototype.filter.call(el.parentNode.children, function(x){ return x.matches(SEL); });
      el.style.setProperty("--atraso", Math.min(irmaos.indexOf(el), 6) * 70 + "ms");
      el.classList.add("revela"); rio.observe(el);
    });
  }

  // contador nos números
  if (temIO) { var cio = new IntersectionObserver(function(es){ es.forEach(function(e){
    if (!e.isIntersecting) return; cio.unobserve(e.target); var el = e.target, alvo = +el.dataset.conta;
    if (parado) { el.textContent = alvo; return; }
    var t0 = null; el.textContent = "0";
    function passo(t){ if (!t0) t0 = t; var p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(passo); }
    requestAnimationFrame(passo);
  }); }, {threshold:.6}); document.querySelectorAll("[data-conta]").forEach(function(el){ cio.observe(el); }); }

  // topo com sombra, barra do celular e balão do WhatsApp
  var topo = document.querySelector(".topo"), barra = document.querySelector(".barra-cel"), balao = document.querySelector(".balao"), pend = false;
  function rola(){ pend = false; var y = window.scrollY; topo.classList.toggle("rolou", y > 8); barra.classList.toggle("mostra", y > 420); }
  window.addEventListener("scroll", function(){ if (!pend) { pend = true; requestAnimationFrame(rola); } }, {passive:true}); rola();
  setTimeout(function(){ balao.classList.add("mostra"); setTimeout(function(){ balao.classList.remove("mostra"); }, 6000); }, 4000);

${RASTREAMENTO}
})();
</script>`;
}

function pagina(v) {
  const [titulo, descricao] = SEO[v];
  let { corpo, preload } = heroComPrioridade(views[v]);
  corpo = trocaLinks(corpo, v);
  let topo = trocaLinks(header, v).replace(new RegExp(`(<a href="/${PAGINAS[v]}") data-nav="${v}"`), '$1 data-nav="' + v + '" aria-current="page"');
  if (v === "inicio") topo = topo.replace(/ aria-current="page"/g, "");
  const ogImg = DOMINIO + "/" + (corpo.match(/<img src="([^"]+)"/) || [, "img/desentupindo-quintal.webp"])[1];
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0F6B37">
<meta name="geo.region" content="BR-GO">
<meta name="geo.placename" content="Goiânia">
<link rel="canonical" href="${url(v)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Cometa Desentupidora e Dedetizadora">
<meta property="og:url" content="${url(v)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/logo.webp" type="image/webp">
<link rel="preload" href="/fonts/archivo-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/source-sans-3.woff2" as="font" type="font/woff2" crossorigin>
${preload}
${headRastreio(v)}
<script type="application/ld+json">${JSON.stringify(empresa)}</script>
<script type="application/ld+json">${JSON.stringify(ldPagina(v, views[v]))}</script>
<style>${css.replace(/url\(fonts\//g, "url(/fonts/")}</style>
</head>
<body>
${noscriptGtm}
${sprite}

${absolutos(topo)}

<main>
${absolutos(corpo)}
</main>
${absolutos(trocaLinks(depoisMain, v)).replace("CNPJ 00.648.783/0001-14</p>", 'CNPJ 00.648.783/0001-14</p>\n      <p style="margin-top:8px"><a href="/politica-de-privacidade">Política de privacidade</a></p>')}
${script(v)}
</body>
</html>
`;
}

// ---------- gera ----------
// limpa a saída, mas mantém .vercel (vínculo com o projeto na Vercel)
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f !== ".vercel" && f !== ".gitignore") fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
for (const v of Object.keys(PAGINAS)) {
  const html = pagina(v);
  fs.writeFileSync(path.join(OUT, (PAGINAS[v] || "index") + ".html"), html);
}

// só os arquivos que alguma página usa
const todas = fs.readdirSync(OUT).filter(f => f.endsWith(".html")).map(f =>fs.readFileSync(path.join(OUT, f), "utf8")).join("\n");
const usados = new Set([...todas.matchAll(/\/((?:img|video|fonts)\/[\w.-]+\.(?:webp|mp4|woff2))/g)].map(m => m[1]));
for (const rel of usados) {
  const de = path.join(SRC, rel);
  if (!fs.existsSync(de)) throw new Error("arquivo não existe: " + rel);
  fs.mkdirSync(path.join(OUT, path.dirname(rel)), { recursive: true });
  fs.copyFileSync(de, path.join(OUT, rel));
}

// página 404
fs.writeFileSync(path.join(OUT, "404.html"), pagina("inicio")
  .replace('page_type:"inicio"', 'page_type:"erro404"')
  .replace(/<title>[^<]*<\/title>/, "<title>Página não encontrada | Cometa</title>")
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">')
  .replace(/<main>[\s\S]*<\/main>/, `<main><section class="faixa"><div class="wrap"><span class="eyebrow">Erro 404</span><h1 style="margin-top:12px">Essa página não existe</h1><p class="lead" style="margin-top:14px">Mas o seu entupimento a gente resolve. Veja os serviços ou chame no WhatsApp.</p><div class="acoes" style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-zap zap-link" data-msg="geral" href="#" target="_blank" rel="noopener"><svg><use href="#i-zap"/></svg>Chamar no WhatsApp</a><a class="btn btn-sec" href="/">Ver serviços</a></div></div></section></main>`));

// política de privacidade (link no rodapé; o Google Ads e a LGPD pedem)
const privacidade = `<main><section class="faixa"><div class="wrap" style="max-width:760px">
<span class="eyebrow">LGPD</span><h1 style="margin-top:12px">Política de privacidade</h1>
<p class="lead" style="margin-top:14px">Esta política explica como a Cometa Desentupidora e Dedetizadora (CNPJ 00.648.783/0001-14, R. 115, nº 468, Setor Sul, Goiânia-GO) trata os dados de quem visita este site, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
<h2 style="margin-top:32px;font-size:1.3rem">Quais dados coletamos</h2>
<p style="margin-top:10px">Este site não tem formulário de cadastro. Só recebemos seus dados quando você mesmo entra em contato pelo WhatsApp ou telefone: nome, número e as informações que você nos passar sobre o serviço, como endereço do atendimento.</p>
<p style="margin-top:10px">Também usamos cookies e ferramentas de medição do Google e da Meta (Facebook e Instagram) para saber quantas pessoas visitam o site, de onde vieram e quais anúncios funcionam melhor. Esses dados são estatísticos e não identificam você pelo nome.</p>
<h2 style="margin-top:32px;font-size:1.3rem">Para que usamos</h2>
<p style="margin-top:10px">Para responder seu contato, fazer o orçamento, agendar e prestar o serviço, emitir nota fiscal e melhorar nossos anúncios e o atendimento. Não vendemos nem repassamos seus dados para terceiros fora dessas finalidades.</p>
<h2 style="margin-top:32px;font-size:1.3rem">Seus direitos</h2>
<p style="margin-top:10px">Você pode pedir a qualquer momento para saber quais dados temos sobre você, corrigir, excluir ou deixar de receber mensagens. Basta falar com a gente pelo WhatsApp ou telefone (62) 3241-3001.</p>
<p style="margin-top:10px">Você também pode bloquear ou apagar os cookies nas configurações do seu navegador.</p>
<p style="margin-top:32px;font-size:.9rem;color:var(--cinza,#555)">Atualizada em novembro de 2026.</p>
</div></section></main>`;
fs.writeFileSync(path.join(OUT, "politica-de-privacidade.html"), pagina("inicio")
  .replace('page_type:"inicio"', 'page_type:"privacidade"')
  .replace(/<title>[^<]*<\/title>/, "<title>Política de privacidade | Cometa Desentupidora e Dedetizadora</title>")
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Como a Cometa Desentupidora e Dedetizadora trata os dados de quem visita o site e entra em contato.">')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow">')
  .replace(/(<link rel="canonical" href=")[^"]*/, `$1${DOMINIO}/politica-de-privacidade`)
  .replace(/<script type="application\/ld\+json">(?!\{"@context":"https:\/\/schema.org","@type":"Plumber")[\s\S]*?<\/script>\n/, "")
  .replace(/<main>[\s\S]*<\/main>/, privacidade));

const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(PAGINAS).map(v => `  <url><loc>${url(v)}</loc><lastmod>${hoje}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api/\n\nSitemap: ${DOMINIO}/sitemap.xml\n`);

// painel do cliente (/dashboard) e coletor (/js/tracker.js): fonte em ../painel, copiados como estão
const PAINEL = path.join(__dirname, "../painel");
fs.cpSync(PAINEL, OUT, { recursive: true });
// vercel.json fica na raiz do repositório (junto de api/), não aqui.

console.log("páginas:", Object.keys(PAGINAS).length, "| arquivos copiados:", usados.size, "| saída:", OUT);

#!/usr/bin/env node
/* Varredura visual de uma página da plataforma (skill padrao-visual, .claude/skills/padrao-visual/SKILL.md).
   Abre o Plataforma.html na demonstração (dados fictícios, sem internet), entra no módulo e na aba pedidos e lista o que
   foge do modelo visual (Produção › Visão geral e Lançamento, plataforma 1.8.38): títulos, cores fora da paleta, tamanho de
   fonte, espaçamento fora da escala, botões primários, filtros, gráficos, datas, emojis e rolagem lateral.
   Só lê a tela: não grava base, não altera o HTML e não confere número nem fórmula (isso é dos testes de cada motor).

   Uso:  node scripts/varredura-visual.mjs --modulo "Produção" --aba overview [--largura 1440] [--tema escuro] [--saida arquivo.md] [--print arquivo.png]
         node scripts/varredura-visual.mjs --lista      (módulos e abas disponíveis)
   Saída: relatório em Markdown (stdout ou --saida). Código de saída 0 mesmo com avisos: é um roteiro de revisão, não um teste. */
import {createRequire} from 'node:module';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const tem=n=>process.argv.includes('--'+n);
const MODULO=arg('modulo','Produção'),ABA=arg('aba',''),LARG=+arg('largura','1440'),TEMA=arg('tema','claro'),SAIDA=arg('saida',''),PRINT=arg('print','');

/* roda dentro do documento da página (quadro do módulo ou a própria casca) */
function varrer(){
  const vis=el=>{if(!el||!el.getBoundingClientRect)return false;const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(el);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05;};
  const nome=el=>{if(!el||!el.tagName)return '';const id=el.id?'#'+el.id:'';const c=[...el.classList].slice(0,2).map(x=>'.'+x).join('');return el.tagName.toLowerCase()+id+c;};
  const caminho=el=>{const p=[];for(let x=el,i=0;x&&x.tagName&&i<3;x=x.parentElement,i++)p.unshift(nome(x));return p.join(' > ');};
  const txt=el=>(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,70);
  const raiz=document.querySelector('#main')||document.querySelector('main')||document.body;
  const R={achados:[],resumo:{}};const A=(tipo,nivel,msg,ex)=>R.achados.push({tipo,nivel,msg,ex:(ex||[]).slice(0,6)});
  const todos=[...raiz.querySelectorAll('*')].filter(vis).filter(x=>!x.closest('.fprev,.fp,.printarea,.rep,.a4,.folha'));   /* prévia de formulário A4 / relatório impresso tem desenho próprio */
  /* paleta: valores das variáveis --* da página (css/brand e kit), resolvidos em rgb */
  const vars=new Set();for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules;}catch(e){continue;}const andar=l=>{for(const r of l){if(r.style)for(const p of r.style)if(p.startsWith('--'))vars.add(p);if(r.cssRules)andar(r.cssRules);}};andar(rs);}
  const prova=document.createElement('span');document.body.appendChild(prova);
  const rgb=v=>{prova.style.color='';prova.style.color=v;return prova.style.color?getComputedStyle(prova).color:'';};
  const cs=getComputedStyle(document.documentElement),pal=new Set(['rgb(0, 0, 0)','rgb(255, 255, 255)','rgba(0, 0, 0, 0)']);
  for(const v of vars){const x=cs.getPropertyValue(v).trim();if(/^(#|rgb|hsl)/i.test(x)){const c=rgb(x);if(c)pal.add(c.replace(/rgba\((\d+), (\d+), (\d+), 1\)/,'rgb($1, $2, $3)'));}}
  prova.remove();
  const semAlfa=c=>c.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/,'rgb($1, $2, $3)');
  R.resumo.paleta=pal.size;
  /* 1 · cabeçalho e títulos */
  const hs=todos.filter(e=>/^H[1-4]$/.test(e.tagName));
  const caixaAlta=hs.filter(h=>getComputedStyle(h).textTransform==='uppercase'||(txt(h).length>12&&txt(h)===txt(h).toUpperCase()&&/[A-ZÀ-Ú]{4}/.test(txt(h))));
  if(caixaAlta.length)A('Títulos','ajustar','Título em caixa alta. O modelo usa caixa de frase em h1–h4 (guia BD; Produção 2.6.29). Rótulos curtos (KPI, cabeçalho de tabela, pílula, chip) podem seguir em maiúsculas.',caixaAlta.map(h=>`"${txt(h)}" (${caminho(h)})`));
  const numSec=todos.filter(e=>e.matches('.vk-sec > b, .vgl-sec > b')&&/^\d{1,2}$/.test(txt(e)));
  if(numSec.length)A('Seções','ajustar','Seção numerada (01, 02…). O modelo tirou a numeração na Produção 2.6.29; as seções têm só título e subtítulo.',numSec.map(b=>`${txt(b)} ${txt(b.parentElement.querySelector('h3')||b)}`));
  /* título da página: h2 (ou o cabeçalho vgl-hd/vk-hd) antes do primeiro cartão; título de cartão não conta */
  const y0=raiz.getBoundingClientRect().top,hd=todos.find(e=>e.matches('.vgl-hd,.vk-hd,.v2-cab,.sqdcp-head'))||hs.find(h=>/^H[12]$/.test(h.tagName)&&!h.closest('.card,section.card,.vk-card,dialog')&&h.getBoundingClientRect().top-y0<260);
  if(!hd)A('Cabeçalho','ajustar','Sem título de página no topo (h2 com subtítulo, antes dos cartões). O modelo abre com título + subtítulo (o que a página mostra) e as ações à direita; título de cartão não substitui o da página.');
  R.resumo.titulos=hs.length;
  /* 2 · tipografia */
  const fontes=new Map(),peq=[],peq2=[];
  for(const e of todos){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const s=getComputedStyle(e),f=s.fontFamily.split(',')[0].replace(/["']/g,'').trim();fontes.set(f,(fontes.get(f)||0)+1);if(parseFloat(s.fontSize)<12&&parseFloat(s.fontSize)>1&&!e.closest('svg'))(parseFloat(s.fontSize)<11?peq:peq2).push(`${s.fontSize} "${txt(e)}" (${caminho(e)})`);}
  R.resumo.fontes=Object.fromEntries([...fontes].sort((a,b)=>b[1]-a[1]).slice(0,5));
  const fora=[...fontes.keys()].filter(f=>!/albert|arial|helvetica|sans-serif|system-ui|segoe|inter|roboto|mono|consolas|courier/i.test(f));
  if(fora.length)A('Tipografia','ajustar','Família fora da marca (FS Albert Pro com reserva Arial/Helvetica, pelas variáveis --f-body/--f-display).',fora);
  if(peq.length)A('Tipografia','ajustar','Texto abaixo de 11 px (o piso da plataforma é 12 px; notas e rótulos usam 12–13 px).',peq);
  if(peq2.length)A('Tipografia','revisar','Texto entre 11 e 12 px (legendas, contadores): levar a 12 px quando couber.',peq2);
  /* 3 · cores */
  const cores=new Map();
  for(const e of todos){const s=getComputedStyle(e);for(const [p,v] of [['texto',s.color],['fundo',s.backgroundColor],['borda',s.borderTopWidth!=='0px'?s.borderTopColor:'']]){if(!v||v==='rgba(0, 0, 0, 0)'||v.startsWith('color('))continue;   /* color(srgb …) = color-mix de tokens: vem da paleta */const c=semAlfa(v);if(pal.has(c)||pal.has(v))continue;const k=p+' '+c;if(!cores.has(k))cores.set(k,[]);cores.get(k).push(caminho(e));}}
  const corLista=[...cores].sort((a,b)=>b[1].length-a[1].length);
  if(corLista.length)A('Cores','revisar','Cor que não é nenhum token de css/brand/kit (pode ser mistura com transparência ou cor fixa no CSS do módulo). Trocar por var(--…) da paleta; verde/amarelo/vermelho só para resultado × meta (semáforo da Administração).',corLista.slice(0,12).map(([k,l])=>`${k} ×${l.length} · ${l[0]}`));
  R.resumo.coresForaDaPaleta=corLista.length;
  /* 4 · espaçamento */
  const ESC=new Set([0,1,2,3,4,8,12,16,24,32]),esp=new Map();
  for(const e of todos){const s=getComputedStyle(e);for(const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','rowGap','columnGap']){const v=parseFloat(s[p]);if(!Number.isFinite(v)||v>32||ESC.has(Math.round(v*10)/10))continue;const k=p.replace(/(Top|Right|Bottom|Left)$/,'')+' '+v+'px';if(!esp.has(k))esp.set(k,[]);esp.get(k).push(caminho(e));}}
  const espLista=[...esp].sort((a,b)=>b[1].length-a[1].length);
  if(espLista.length)A('Espaçamento','revisar (baixa)','Valor fora da escala 4/8/12/16/24/32 px (var(--sp-8,8px) etc.). Arredondar para o passo mais próximo; no empate, o menor.',espLista.slice(0,10).map(([k,l])=>`${k} ×${l.length} · ${l[0]}`));
  /* 5 · botões */
  const bts=todos.filter(e=>e.matches('button,a.btn,a.b,[role="button"]'));
  const prim=bts.filter(b=>!b.closest('td,tr')&&b.getAttribute('aria-pressed')!=='true'&&b.getAttribute('aria-selected')!=='true'&&!b.closest('.seg,[role="tablist"],[role="group"]')&&(/\bprimary\b|\bprimario\b|\bb-pri\b|\bp\b/.test(b.className)||getComputedStyle(b).backgroundColor===rgb_(document,'--accent')));   /* escolha marcada (pílula, grupo) não é botão primário */
  const grupos=new Map();for(const b of prim){const g=b.closest('header,section,.card,footer,.row,.vgl-hd,form,dialog')||raiz;grupos.set(g,(grupos.get(g)||[]).concat(b));}
  const varios=[...grupos].filter(([,l])=>l.length>1);
  if(varios.length)A('Botões','ajustar','Mais de um botão primário no mesmo grupo. O modelo tem um primário por região (ex.: Apresentar no cabeçalho, Fechar dia no cabeçalho do dia, Relatório do período em Explorar dados); os demais são secundários.',varios.map(([g,l])=>`${nome(g)}: ${l.map(b=>'"'+txt(b)+'"').join(', ')}`));
  const semNome=bts.filter(b=>!txt(b)&&!b.getAttribute('aria-label')&&!b.title);
  if(semNome.length)A('Botões','ajustar','Botão só com ícone e sem aria-label/title.',semNome.map(caminho));
  const baixos=bts.filter(b=>b.getBoundingClientRect().height<28&&!b.closest('table,.vg-barra,.pill')&&!b.matches('.v2-help,.ib,i.i,.v2-help *'));
  if(baixos.length)A('Botões','revisar','Alvo de clique baixo (< 28 px; controles da página têm 40 px, botões pequenos sm ≥ 32 px).',baixos.map(b=>`"${txt(b)}" ${Math.round(b.getBoundingClientRect().height)}px (${caminho(b)})`));
  R.resumo.botoes={total:bts.length,primarios:prim.length};
  /* 6 · filtros */
  const campos=todos.filter(e=>e.matches('select,input[type="date"],input[type="text"],input[type="search"],input:not([type])'));
  const caixa=campos.length?campos[0].closest('#gFilters,.filtros,.filters,.vk-fil'):null;   /* SQDCP: data/linha/turno são o recorte do quadro, não filtro de consulta */   /* só cartão de filtros; formulário de configuração não */
  const naCaixa=caixa?[...caixa.querySelectorAll('select,input[type=text],input[type=search],input:not([type])')].filter(c=>vis(c)&&!c.closest('.vdf,.dfield,.vac-mes,table')).length:0;   /* conta como o vacLimparFiltros: sem datas, caixas de marcar e campos de tabela */
  if(naCaixa>=3){   /* barra só de data/linha (como a do Lançamento) não é um cartão de filtros */
    const temLimpar=[...(caixa||raiz).querySelectorAll('button,a')].some(b=>/limpar/i.test(b.textContent));
    if(!temLimpar)A('Filtros','ajustar','Página com filtros sem "Limpar filtros". O modelo: Período (datas + Hoje/Ontem/7 dias/30 dias/Personalizado), demais filtros numa linha, "Limpar filtros" no fim da linha e uma linha-resumo do recorte abaixo.');
    const semRot=campos.filter(c=>!c.closest('table')&&!c.labels?.length&&!c.getAttribute('aria-label')&&!c.closest('label')&&!c.placeholder&&!/^vac-dt/.test(c.className));
    if(semRot.length)A('Filtros','ajustar','Campo sem rótulo visível (label acima do campo, em caixa de frase).',semRot.map(caminho));
  }
  const datas=[...raiz.querySelectorAll('input[type="date"],input[type="datetime-local"]')].filter(vis);
  if(datas.length)A('Datas','ajustar','Campo de data nativo visível (mostra MM/DD/AAAA no Chrome em inglês). Usar o campo DD/MM/AAAA do kit (vacDatas; na Produção, DateFields).',datas.map(caminho));
  const meses=[...raiz.querySelectorAll('input[type="month"],input[type="week"]')].filter(vis);
  if(meses.length)A('Datas','ajustar','Seletor de mês/semana nativo visível: o Chrome mostra o nome do mês no idioma do Windows (ex.: "November 2026"). Usar ‹ mês › com o nome em português, como o seletor de dia do Lançamento.',meses.map(m=>`${m.value} (${caminho(m)})`));
  const arqs=[...raiz.querySelectorAll('input[type="file"]')].filter(vis);
  if(arqs.length)A('Datas','ajustar','Campo de arquivo nativo visível ("Choose File / No file chosen" no Chrome em inglês). O kit troca por "Escolher arquivo" (vacCampos, comum/interface).',arqs.map(caminho));
  R.resumo.filtros=campos.length;
  /* 7 · gráficos */
  const svgs=todos.filter(e=>e.tagName==='svg'&&e.getBoundingClientRect().width>200&&e.getBoundingClientRect().height>100&&!e.closest('.l3-cv,.mapa,[data-mapa]')&&!e.matches('.ov'));   /* desenho do mapa (Linha 360°) não é gráfico */
  const semTit=[],semUn=[];
  for(const s of svgs){const card=s.closest('section.card,section.panel')||s.closest('.card,.panel,.kpi,.vg-it')||s.parentElement;const h=card&&card.querySelector('h2,h3,h4,header,:scope > .l,[class*="tit"],[class*="ttl"],.ct,.sec-h');if(!h)semTit.push(caminho(s));const t=card?card.textContent:'';if(!/valores em|\b(min|un|mil|kg|%|h|R\$|US\$|€|caixas|peças)\b/i.test(t))semUn.push(h?txt(h):caminho(s));}
  if(semTit.length)A('Gráficos','ajustar','Gráfico sem cartão com título. Modelo: cartão com título (pergunta que o gráfico responde), linha "Valores em <unidade>" quando o eixo não traz a unidade, legenda e base zero.',semTit);
  if(semUn.length)A('Gráficos','revisar','Gráfico sem unidade visível no título, eixo ou linha "Valores em …".',semUn);
  R.resumo.graficos=svgs.length;
  /* 8 · emojis e símbolos soltos */
  const emo=todos.filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&/[\u{1F300}-\u{1FAFF}☀-⛿✀-➿]/u.test(n.textContent)));
  if(emo.length)A('Ícones','revisar','Emoji/símbolo no texto. O kit usa vacIcone (Lucide), com texto ao lado; 🔒/🔓 do Portal são exceção registrada.',emo.map(e=>`"${txt(e)}" (${caminho(e)})`));
  /* 9 · rolagem lateral */
  const de=document.scrollingElement||document.documentElement;
  if(de.scrollWidth>de.clientWidth+2)A('Responsivo','ajustar',`Rolagem lateral da página (${de.scrollWidth} px de conteúdo em ${de.clientWidth} px). Tabelas largas rolam dentro do próprio cartão.`);
  /* 10 · estados */
  const vazio=todos.filter(e=>/^(sem dados|nenhum|—)$/i.test(txt(e))).length;R.resumo.estadosVazios=vazio;
  return R;
  function rgb_(doc,v){const x=getComputedStyle(doc.documentElement).getPropertyValue(v).trim();if(!x)return '__';const p=doc.createElement('span');p.style.color=x;doc.body.appendChild(p);const c=getComputedStyle(p).color;p.remove();return c;}
}

const html=fs.readFileSync(path.join(ROOT,'Plataforma.html'));
const srv=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html);});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{
  const ctx=await browser.newContext({viewport:{width:LARG,height:1000},colorScheme:TEMA==='escuro'?'dark':'light'});
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/,r=>r.abort());
  const p=await ctx.newPage();const erros=[];p.on('pageerror',e=>erros.push(String(e.message||e)));
  await p.goto('http://127.0.0.1:'+srv.address().port+'/?demo=1');await p.waitForSelector('.sidebar',{timeout:30000});
  if(tem('lista')){
    const mods=await p.locator('.sidebar button').allInnerTexts();console.log('Módulos na barra lateral:\n- '+mods.map(s=>s.trim()).filter(Boolean).join('\n- '));
    await p.locator('.sidebar').getByRole('button',{name:MODULO}).first().click();await p.waitForTimeout(2500);
    const abas=await p.$$eval('.module-tabs button[data-tab-id]',b=>b.map(x=>x.dataset.tabId+' · '+x.textContent.trim()));console.log(`\nAbas de ${MODULO} (--aba <id>):\n- `+abas.join('\n- '));
  }else{
    await p.locator('.sidebar').getByRole('button',{name:MODULO}).first().click();await p.waitForTimeout(2500);
    if(ABA){const b=p.locator(`.module-tabs button[data-tab-id="${ABA}"]`);if(await b.count())await b.first().click();else console.error(`Aba "${ABA}" não encontrada em ${MODULO}; use --lista.`);await p.waitForTimeout(3000);}
    const ifr=await p.$('iframe[title^="Módulo"]');const fr=ifr?await ifr.contentFrame():p.mainFrame();
    if(ifr){await p.setViewportSize({width:LARG,height:1000});}
    /* abre o que vem recolhido (grupos, blocos, detalhes) para a varredura ver gráficos e campos */
    await fr.evaluate(async()=>{const esp=ms=>new Promise(r=>setTimeout(r,ms));for(const b of [...document.querySelectorAll('button')].filter(b=>/^expandir tudo$/i.test(b.textContent.trim())))b.click();await esp(400);
      for(const b of document.querySelectorAll('.vgl-grp.fechado .vgl-gh, .vk-grp.fechado .vk-gh, [data-vk-grupo].fechado button'))b.click();document.querySelectorAll('details:not([open])').forEach(d=>d.open=true);await esp(1200);});
    const R=await fr.evaluate(varrer);
    const casca=await p.evaluate(varrer);   /* cabeçalho, abas e barra de ações da casca (comuns a todas as páginas) */
    if(PRINT)await p.screenshot({path:PRINT,fullPage:true});
    const linhas=[`# Varredura visual · ${MODULO}${ABA?' › '+ABA:''}`,'',`Largura ${LARG} px · tema ${TEMA} · demonstração (dados fictícios). Modelo: Produção › Visão geral e Lançamento (plataforma 1.8.38). Só aparência: números e fórmulas não são avaliados.`,'',
      `Resumo: ${R.resumo.titulos} títulos · ${R.resumo.botoes.total} botões (${R.resumo.botoes.primarios} primários) · ${R.resumo.filtros} campos · ${R.resumo.graficos} gráficos · ${R.resumo.coresForaDaPaleta} cores fora da paleta · fontes ${JSON.stringify(R.resumo.fontes)}`,''];
    const bloco=(t,L)=>{if(!L.length){linhas.push(`## ${t}`,'','Nada fora do modelo.','');return;}linhas.push(`## ${t}`,'');for(const a of L){linhas.push(`- **${a.tipo}** (${a.nivel}): ${a.msg}`);for(const x of a.ex)linhas.push(`  - ${x}`);}linhas.push('');};
    bloco('Página',R.achados);
    if(ifr)bloco('Casca (comum a todas as páginas; só conferir se mudou)',casca.achados.filter(a=>!['Cores','Espaçamento'].includes(a.tipo)));
    if(erros.length)linhas.push('## Erros de JavaScript','',...erros.map(e=>'- '+e),'');
    const out=linhas.join('\n');if(SAIDA){fs.writeFileSync(SAIDA,out);console.log('Relatório: '+SAIDA);}else console.log(out);
  }
}finally{await browser.close();srv.close();}

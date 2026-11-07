// Verificação visual das cinco páginas (auditoria de layout de 06/11/2026): geometria do cabeçalho, abas, contraste e tema.
// node testes/tvisual.js            → tabela de medidas + checagens; prints em testes/saida/visual/
// node testes/tvisual.js --sem-print → só medidas
// Sai com código 1 se alguma checagem falhar.
const SP=require('path').resolve(__dirname,'..')+'/';const S='file://'+SP+'paginas/';const fs=require('fs');
const {chromium}=require('playwright');const PRINT=!process.argv.includes('--sem-print');
const CONSTR=new Set(['Equipamentos','Iniciativas','Projetos']);   /* em construção: sem dados, sem ações de base, sem gráficos */
const PAGS=[['Portal','Portal.html'],['Produção','OEE-Vacutainer.html'],['Waste','Perdas-Ordem.html'],['Gel','Gestão-Gel-Vacutainer.html'],['Paradas','Paradas.html'],
  /* páginas em construção (fontes/modelo/gerar_paginas.py) */['Equipamentos','Equipamentos.html'],['Iniciativas','Iniciativas.html'],['Projetos','Projetos.html']];
const LARG=[1920,1440,1024,768,390];
const errs=[];const ok=(c,m)=>{console.log((c?'ok   ':'FALHA ')+m);if(!c)errs.push(m)};
// entra no exemplo/teste de cada página (dados fictícios), fecha janelas iniciais
// entra no exemplo/teste de cada página (dados fictícios), fecha janelas iniciais. Sem try/catch: se a entrada falhar, a página registra erro.
const EXEMPLO={Equipamentos:()=>{},Iniciativas:()=>{},Projetos:()=>{},Portal:()=>{enterTest()},Waste:()=>{enterTest()},Paradas:()=>{modoTeste()},
  Gel:()=>{enterDemo();render()},
  'Produção':()=>{document.querySelectorAll('.overlay').forEach(o=>o.remove());Demo.enterExample();
    // o exemplo marca os dias como demonstração (fora dos indicadores); em memória, tira a marca para a tela ficar preenchida (como na auditoria)
    const db=Store.S.db;for(const k of ['productionDays','monthPlans','calendar'])(db[k]||[]).forEach(d=>delete d.demo);Engine.bumpConfig();document.querySelectorAll('.overlay').forEach(o=>o.remove());render()}};
const MEDIR=()=>{const q=s=>document.querySelector(s),r=e=>e?e.getBoundingClientRect():null,cs=e=>e?getComputedStyle(e):null;
  const wrap=q('.vsuite .wrap'),vp=q('.vpage'),tabs=q('nav.vtabs'),tab=q('nav.vtabs #nav button, nav.vtabs #nav [role=tab], nav.vtabs .tab');
  const lum=c=>{const srgb=/^color\(srgb/.test(c);const m=c.replace(/^color\(srgb/,'').match(/[\d.]+/g);if(!m)return null;const [R,G,B]=m.slice(0,3).map(x=>{x=srgb?+x:+x/255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*R+.7152*G+.0722*B};
  const opaco=c=>{const m=c.replace(/^color\(srgb/,'').match(/[\d.]+/g);if(!m)return false;const al=/\//.test(c)?+m[3]:(m.length>=4?+m[3]:1);return al>=.95};
  // contraste: texto pequeno (< 18,66 px) sobre fundo sólido do próprio elemento
  const baixos=[];for(const e of document.querySelectorAll('body *')){if(!e.offsetParent&&cs(e).position!=='fixed')continue;const st=cs(e);if(!opaco(st.backgroundColor)||st.backgroundColor==='rgba(0, 0, 0, 0)')continue;
    const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!own)continue;const fz=parseFloat(st.fontSize);if(fz>=18.66)continue;
    const a=lum(st.color),b=lum(st.backgroundColor);if(a==null||b==null||!opaco(st.color))continue;const k=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    if(k<4.5){const rr=r(e);if(rr.width<2||rr.height<2)continue;baixos.push({t:(e.textContent||'').trim().slice(0,30),k:+k.toFixed(2),c:st.color,bg:st.backgroundColor,cls:e.className&&String(e.className).slice(0,30)})}}
  const dd=[...document.querySelectorAll('input[type=date]')].filter(x=>x.offsetParent).map(x=>cs(x).colorScheme);
  return{bodyMargin:cs(document.body).margin,left:r(wrap)&&Math.round(r(wrap).left+parseFloat(cs(wrap).paddingLeft)),wrapW:r(wrap)&&Math.round(r(wrap).width),
    vsuiteH:r(q('.vsuite'))&&+r(q('.vsuite')).height.toFixed(1),vpageH:r(vp)&&+r(vp).height.toFixed(1),tabsH:r(tabs)&&+r(tabs).height.toFixed(1),tabFont:tab&&cs(tab).fontSize,
    tituloX:r(q('#vacTitulo'))&&Math.round(r(q('#vacTitulo')).left),h1Top:r(q('#vacTitulo'))&&Math.round(r(q('#vacTitulo')).top),
    scrollX:document.documentElement.scrollWidth>innerWidth+1,theme:document.documentElement.getAttribute('data-theme'),bg:cs(document.body).backgroundColor,
    baixos,dateScheme:[...new Set(dd)],
    cab:(()=>{const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&getComputedStyle(e).visibility!=='hidden'};const acts=[...document.querySelectorAll('.vpage .vacts > button, .vpage .vacts > .tvmenu > button, .vpage .vacts > details > summary')].filter(b=>!b.hidden&&getComputedStyle(b).display!=='none');const st=document.querySelector('#stBase');return{acoes:acts.length,acoesVisiveis:acts.filter(vis).length,status:st&&st.children.length?vis(st):true,h:Math.round(document.querySelector('.vpage').getBoundingClientRect().height)}})(),
    kpis:document.querySelectorAll('.kpi, .mk > div').length,graficos:document.querySelectorAll('main svg, #main svg, .tab.on svg, section.mod svg, #app svg').length,
    testeParadas:!!(document.querySelector('#testBar')&&!document.querySelector('#testBar').hidden),
    abaAtiva:(()=>{const e=document.querySelector('nav.vtabs #nav .on:not(.ngrp), nav.vtabs #nav [aria-selected="true"], nav.vtabs .ngrp.on>.tab');if(!e)return null;const s=cs(e);const m=s.borderBottomColor.replace(/^color\(srgb/,'').match(/[\d.]+/g)||[];const al=/\//.test(s.borderBottomColor)?+m[3]:(m.length>=4?+m[3]:1);return{txt:e.textContent.trim().slice(0,20),w:parseFloat(s.borderBottomWidth),visivel:al>0.5&&s.borderBottomStyle!=='none'}})(),
    svgMin:(()=>{let m=null;for(const tx of document.querySelectorAll('section.mod svg text')){const sv=tx.ownerSVGElement,vb=sv.viewBox&&sv.viewBox.baseVal;if(!vb||!vb.width||!sv.getBoundingClientRect().width)continue;const px=parseFloat(tx.getAttribute('font-size')||cs(tx).fontSize)*sv.getBoundingClientRect().width/vb.width;m=m==null?px:Math.min(m,px)}return m&&+m.toFixed(1)})()}};
(async()=>{const b=await chromium.launch();if(PRINT)fs.mkdirSync(SP+'testes/saida/visual',{recursive:true});
 const linhas=[];const res={};
 for(const tema of ['light','dark']){
  const ctx=await b.newContext({colorScheme:'light'});await ctx.addInitScript(t=>{try{if(!sessionStorage.getItem('__tv')){localStorage.setItem('vac.theme',t);sessionStorage.setItem('__tv','1')}}catch(e){}},tema);
  for(const [nome,arq] of PAGS){const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));p.on('dialog',d=>d.accept());
   for(const w of LARG){await p.setViewportSize({width:w,height:900});await p.goto(S+encodeURI(arq));await p.waitForTimeout(900);
    await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));
    const vazio=await p.evaluate(MEDIR);
    await p.evaluate(EXEMPLO[nome]);await p.waitForTimeout(700);await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>o.remove()));
    const ex=await p.evaluate(MEDIR);res[nome+'|'+tema+'|'+w]={vazio,ex};
    linhas.push([nome,tema,w,vazio.bodyMargin,vazio.left,vazio.vsuiteH,vazio.vpageH,vazio.tabsH,vazio.tabFont,ex.tabsH,ex.scrollX?'SIM':'',ex.baixos.length].join('\t'));
    if(PRINT&&(w===1440||w===390))await p.screenshot({path:`${SP}testes/saida/visual/${nome}-${tema}-${w}.png`});
   }
   if(pe.length)errs.push(nome+' erro de página: '+pe[0]);await p.close()}
  await ctx.close()}
 console.log('página\ttema\tlarg\tmargem\tesq\tbarra\tfaixa\tabas\tfonte\tabas(ex)\trolagemX\tcontraste<4,5');linhas.forEach(l=>console.log(l));
 fs.mkdirSync(SP+'testes/saida',{recursive:true});fs.writeFileSync(SP+'testes/saida/tvisual.json',JSON.stringify(res,null,1));
 // ---- checagens (critérios de aceite da prioridade 1)
 for(const w of LARG)for(const tema of ['light','dark']){const L=PAGS.map(([n])=>res[n+'|'+tema+'|'+w].vazio);
  ok(L.every(x=>x.bodyMargin==='0px'),`${w}px ${tema}: body sem margem nas cinco`);
  ok(new Set(L.map(x=>x.left)).size===1,`${w}px ${tema}: barra começa no mesmo x nas cinco (${L.map(x=>x.left).join('/')})`);
  ok(new Set(L.map(x=>x.tituloX)).size===1,`${w}px ${tema}: título da página no mesmo x (${L.map(x=>x.tituloX).join('/')})`);
  ok(L.every(x=>!x.scrollX),`${w}px ${tema}: sem rolagem horizontal da página${L.some(x=>x.scrollX)?' ('+PAGS.filter((_,i)=>L[i].scrollX).map(x=>x[0]).join(', ')+')':''}`)}
 for(const [n] of PAGS)for(const w of LARG){const x=res[n+'|light|'+w].ex;ok(x.tabsH<=60,`${n} ${w}px: faixa de abas ≤ 60 px (${x.tabsH})`)}
 const CHEIO=/badge|cnt|count|tag-n|\bn\b|btn|\bb\b|primary|\bp\b/;
 for(const [n] of PAGS)for(const tema of ['light','dark']){const x=res[n+'|'+tema+'|1440'].ex;const ch=x.baixos.filter(b=>CHEIO.test(b.cls||'')&&b.k<4.5),ob=x.baixos.filter(b=>!ch.includes(b));
  ok(!ch.length,`${n} ${tema}: contadores, badges e botões com contraste ≥ 4,5 (${ch.slice(0,4).map(b=>b.t+' '+b.k).join(' · ')})`);
  ok(!x.baixos.some(b=>b.k<3),`${n} ${tema}: nenhum texto pequeno abaixo de 3:1 (${x.baixos.filter(b=>b.k<3).slice(0,4).map(b=>b.t+' '+b.k+' '+b.cls).join(' · ')})`);
  if(ob.length)console.log(`obs  ${n} ${tema}: ${ob.length} texto(s) pequeno(s) entre 3 e 4,5:1 (${[...new Set(ob.map(b=>b.cls+' '+b.k))].slice(0,4).join(' · ')})`)}
 for(const w of [1920,1440,1024,768]){const x=res['Portal|light|'+w].ex;ok(x.svgMin==null||x.svgMin>=10.5,`Portal ${w}px: texto dos gráficos dos cards com ${x.svgMin} px (mínimo 10,5)`)}
 for(const [n] of PAGS){const x=res[n+'|dark|1440'].ex;ok(x.theme==='dark',`${n}: tema escuro explícito aplicado (${x.theme})`);ok(!x.dateScheme.length||x.dateScheme.every(s=>/dark/.test(s)),`${n}: campos de data no esquema escuro (${x.dateScheme})`)}
 // ---- continuidade do tema: Portal escuro → Paradas → muda em Paradas → volta ao Portal
 {const ctx=await b.newContext({colorScheme:'light'});const p=await ctx.newPage();await p.goto(S+'Portal.html');await p.evaluate(()=>localStorage.setItem('vac.theme','dark'));
  const ler=async()=>p.evaluate(()=>({st:localStorage.getItem('vac.theme'),at:document.documentElement.getAttribute('data-theme'),bg:getComputedStyle(document.body).backgroundColor}));
  await p.goto(S+'Paradas.html');await p.waitForTimeout(600);const a=await ler();
  await p.evaluate(()=>document.querySelector('#btnTheme')&&document.querySelector('#btnTheme').click());await p.waitForTimeout(300);const b2=await ler();
  await p.goto(S+'Portal.html');await p.waitForTimeout(600);const c=await ler();
  for(const [,arq] of PAGS){await p.goto(S+encodeURI(arq));await p.waitForTimeout(500);const x=await ler();ok(x.at===c.at||(c.at==null&&x.at==null),`tema igual ao voltar para ${arq} (${x.at})`)}
  ok(a.at==='dark','Paradas abre escuro quando o Portal ficou escuro');ok(['auto','light','dark'].includes(b2.st),`Paradas grava o tema como texto simples (${b2.st})`);ok(c.at===(b2.st==='auto'?null:b2.st),`Portal lê o tema escolhido em Paradas (${c.at})`);
  await p.evaluate(()=>localStorage.setItem('vac.user','Ana Teste'));await p.goto(S+'Paradas.html');await p.waitForTimeout(500);
  ok(await p.evaluate(()=>user()==='Ana Teste'),'Paradas lê o usuário gravado pelo Portal');await ctx.close()}
 // ---- cabeçalho em telas menores: status e ações continuam visíveis e dentro da tela
 for(const [n] of PAGS.filter(([n])=>!CONSTR.has(n)))for(const w of [768,390]){const x=res[n+'|light|'+w].ex.cab;ok(x.acoes>0&&x.acoesVisiveis===x.acoes&&x.status,`${n} ${w}px: cabeçalho com status e ${x.acoesVisiveis}/${x.acoes} ações visíveis (faixa de ${x.h}px)`)}
 // ---- revisão c341f8e: telas preenchidas, aba ativa marcada, gráficos, modo de teste do Paradas
 const MINKPI={Portal:4,'Produção':4,Waste:4,Gel:4,Paradas:3};
 for(const [n] of PAGS)for(const tema of ['light','dark']){const x=res[n+'|'+tema+'|1440'].ex;if(CONSTR.has(n)){ok(x.abaAtiva&&x.abaAtiva.visivel&&x.abaAtiva.w>=2.5,`${n} ${tema}: aba ativa com a marca colorida (em construção)`);continue}
  ok(x.kpis>=MINKPI[n],`${n} ${tema}: tela do exemplo preenchida (${x.kpis} indicadores)`);
  ok(x.abaAtiva&&x.abaAtiva.visivel&&x.abaAtiva.w>=2.5,`${n} ${tema}: aba ativa com a marca colorida (${x.abaAtiva&&x.abaAtiva.txt}: ${x.abaAtiva&&x.abaAtiva.w}px, visível ${x.abaAtiva&&x.abaAtiva.visivel})`);
  ok(x.graficos>=1,`${n} ${tema}: gráficos presentes na tela inicial do exemplo (${x.graficos} svg)`)}
 ok(res['Paradas|light|1440'].ex.testeParadas&&res['Paradas|dark|1440'].ex.testeParadas,'Paradas: entrou de fato no modo de teste (faixa visível)');
 // abas: trocar de aba e redimensionar sem recarregar mantém a aba ativa à vista (Gel, 11 abas)
 {const ctx=await b.newContext({viewport:{width:1440,height:800}});const p=await ctx.newPage();await p.goto(S+encodeURI('Gestão-Gel-Vacutainer.html'));await p.waitForTimeout(900);
  await p.evaluate(()=>{enterDemo();render()});await p.waitForTimeout(400);await p.click('nav.vtabs [data-t=painel]');await p.waitForTimeout(600);
  for(const w of [1024,768,390]){await p.setViewportSize({width:w,height:800});await p.waitForTimeout(500);
   const r=await p.evaluate(()=>{const t=document.querySelector('nav.vtabs .tabs'),a=t.querySelector('[aria-selected="true"]'),R=t.getBoundingClientRect(),A=a.getBoundingClientRect();return{dentro:A.left>=R.left-1&&A.right<=R.right+1,aba:a.textContent.trim()}});
   ok(r.dentro,`Gel: aba ativa (${r.aba}) continua à vista ao redimensionar para ${w}px sem recarregar`)}
  // trocar de aba pelo clique muda a marca
  await p.setViewportSize({width:1440,height:800});await p.waitForTimeout(300);await p.click('nav.vtabs [data-t=cons]');await p.waitForTimeout(400);
  const sel=await p.evaluate(()=>[...document.querySelectorAll('nav.vtabs [aria-selected="true"]')].map(e=>e.dataset.t).join(','));ok(sel==='cons','Gel: clicar numa aba seleciona só ela ('+sel+')');await ctx.close()}
 // contraste com menus abertos: submenu da Produção (contadores) e menu Mais do Gel, nos dois temas
 for(const tema of ['light','dark']){const ctx=await b.newContext({viewport:{width:1440,height:900},colorScheme:'light'});await ctx.addInitScript(t=>{try{localStorage.setItem('vac.theme',t)}catch(e){}},tema);
  const p=await ctx.newPage();await p.goto(S+'OEE-Vacutainer.html');await p.waitForTimeout(1300);await p.evaluate(EXEMPLO['Produção']);await p.waitForTimeout(700);
  const g=await p.$('nav.vtabs .ngrp.tem:has(.nmenu .cnt)');if(g){await g.hover();await p.waitForTimeout(300)}
  const k=await p.evaluate(MEDIR);const menu=k.baixos.filter(x=>/cnt/.test(x.cls||''));
  const vis=await p.evaluate(()=>{const c=document.querySelector('.nmenu .cnt');return c?getComputedStyle(c.closest('.nmenu')).display!=='none':false});
  ok(vis&&!menu.length,`Produção ${tema}: submenu aberto com contador legível (${menu.map(x=>x.t+' '+x.k).join(', ')||'≥ 4,5:1'})`);
  const pg=await ctx.newPage();await pg.goto(S+encodeURI('Gestão-Gel-Vacutainer.html'));await pg.waitForTimeout(900);await pg.evaluate(()=>{enterDemo();render()});await pg.waitForTimeout(300);await pg.click('#gelMais summary');await pg.waitForTimeout(200);
  const kg=await pg.evaluate(MEDIR);ok(!kg.baixos.some(x=>x.k<4.5&&/vmais|btn/.test(x.cls||'')),`Gel ${tema}: menu Mais aberto com contraste ≥ 4,5`);await ctx.close()}
 // Paradas no modo de teste: faixa legível e gráficos mensais com uma unidade só na escala (eixo e totais)
 for(const tema of ['light','dark']){const ctx=await b.newContext({viewport:{width:1440,height:900},colorScheme:'light'});await ctx.addInitScript(t=>{try{localStorage.setItem('vac.theme',t)}catch(e){}},tema);
  const p=await ctx.newPage();await p.goto(S+'Paradas.html');await p.waitForTimeout(1000);await p.evaluate(()=>modoTeste());await p.waitForTimeout(700);
  const k=await p.evaluate(MEDIR);const fx=await p.evaluate(()=>{const e=document.querySelector('#testBar'),s=getComputedStyle(e);return{vis:!e.hidden,c:s.color,bg:s.backgroundColor}});
  const lum=c=>{const srgb=/^color\(srgb/.test(c);const m=c.replace(/^color\(srgb/,'').match(/[\d.]+/g);const [R,G,B]=m.slice(0,3).map(x=>{x=srgb?+x:+x/255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*R+.7152*G+.0722*B};
  const kc=(Math.max(lum(fx.c),lum(fx.bg))+.05)/(Math.min(lum(fx.c),lum(fx.bg))+.05);
  ok(fx.vis&&kc>=4.5,`Paradas ${tema}: faixa do modo de teste visível e legível (${kc.toFixed(2)}:1)`);
  const un=await p.evaluate(()=>{const r={};for(const v of ['geral','pareto','equip','recor']){App.go(v);for(const s of document.querySelectorAll('#main svg.chart')){const T=[...s.querySelectorAll('text')].map(x=>x.textContent.trim()).filter(x=>/\d/.test(x)&&!/\//.test(x)&&!/^[a-zç]{3}\/\d{2}$/i.test(x));const u=new Set(T.map(x=>/\d h\b/.test(x)?'h':/\d min\b/.test(x)?'min':/^[\d.,]+$/.test(x)?'número':null).filter(Boolean));if(u.size)r[v+'#'+[...document.querySelectorAll('#main svg.chart')].indexOf(s)]=[...u].join('+')}}App.go('geral');return r});
  const mix=Object.entries(un).filter(([k,u])=>/\+/.test(u));
  ok(Object.keys(un).length>0&&!mix.length,`Paradas ${tema}: cada gráfico de barras usa uma unidade só (${JSON.stringify(un)})`);await ctx.close()}
 // tema antigo gravado com aspas (Paradas até 1.0.7): todas as páginas reconhecem
 {const ctx=await b.newContext({colorScheme:'light'});const p=await ctx.newPage();await p.goto(S+'Portal.html');await p.evaluate(()=>localStorage.setItem('vac.theme','"dark"'));
  for(const [n,arq] of PAGS){await p.goto(S+encodeURI(arq));await p.waitForTimeout(400);const at=await p.evaluate(()=>[document.documentElement.getAttribute('data-theme'),localStorage.getItem('vac.theme')]);ok(at[0]==='dark'&&at[1]==='dark',`${n}: tema antigo "\"dark\"" normalizado e aplicado (${at.join(' / ')})`)}
  await ctx.close()}
 // ---- menu Mais do Gel: dentro da tela e com as ações
 for(const w of [1440,390]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.goto(S+encodeURI('Gestão-Gel-Vacutainer.html'));await p.waitForTimeout(900);
  await p.evaluate(()=>{try{enterDemo();render()}catch(e){}});await p.waitForTimeout(400);await p.click('#gelMais summary');await p.waitForTimeout(200);
  const r=await p.evaluate(()=>{const l=document.querySelector('#gelMais .vmais-l').getBoundingClientRect();return{l:l.left,r:l.right,w:innerWidth,ids:[...document.querySelectorAll('#gelMais .vmais-l>button')].map(b=>b.id).join(',')}});
  ok(r.l>=0&&r.r<=r.w,`Gel ${w}px: menu Mais dentro da tela (${Math.round(r.l)}–${Math.round(r.r)} de ${r.w})`);ok(r.ids==='btnSend,btnPdf,btnTools,btnGuide',`Gel ${w}px: menu Mais com Enviar, Fichas, Configuração e Guia`);await ctx.close()}
 console.log(errs.length?errs.length+' falha(s)':'sem erros');await b.close();if(errs.length)process.exitCode=1})();

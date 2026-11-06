// Verificação visual das cinco páginas (auditoria de layout de 06/11/2026): geometria do cabeçalho, abas, contraste e tema.
// node testes/tvisual.js            → tabela de medidas + checagens; prints em testes/saida/visual/
// node testes/tvisual.js --sem-print → só medidas
// Sai com código 1 se alguma checagem falhar.
const SP=require('path').resolve(__dirname,'..')+'/';const S='file://'+SP+'paginas/';const fs=require('fs');
const {chromium}=require('playwright');const PRINT=!process.argv.includes('--sem-print');
const PAGS=[['Portal','Portal.html'],['Produção','OEE-Vacutainer.html'],['Waste','Perdas-Ordem.html'],['Gel','Gestão-Gel-Vacutainer.html'],['Paradas','Paradas.html']];
const LARG=[1920,1440,1024,768,390];
const errs=[];const ok=(c,m)=>{console.log((c?'ok   ':'FALHA ')+m);if(!c)errs.push(m)};
// entra no exemplo/teste de cada página (dados fictícios), fecha janelas iniciais
const EXEMPLO={Portal:()=>{try{enterTest()}catch(e){}},Waste:()=>{try{enterTest()}catch(e){}},Paradas:()=>{try{enterTest()}catch(e){}},
  Gel:()=>{try{enterDemo();render()}catch(e){}},'Produção':()=>{document.querySelectorAll('.overlay').forEach(o=>o.remove());try{Demo.enterExample()}catch(e){}}};
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
  ok(L.every(x=>!x.scrollX),`${w}px ${tema}: sem rolagem horizontal da página`)}
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
 // ---- menu Mais do Gel: dentro da tela e com as ações
 for(const w of [1440,390]){const ctx=await b.newContext({viewport:{width:w,height:800}});const p=await ctx.newPage();await p.goto(S+encodeURI('Gestão-Gel-Vacutainer.html'));await p.waitForTimeout(900);
  await p.evaluate(()=>{try{enterDemo();render()}catch(e){}});await p.waitForTimeout(400);await p.click('#gelMais summary');await p.waitForTimeout(200);
  const r=await p.evaluate(()=>{const l=document.querySelector('#gelMais .vmais-l').getBoundingClientRect();return{l:l.left,r:l.right,w:innerWidth,ids:[...document.querySelectorAll('#gelMais .vmais-l>button')].map(b=>b.id).join(',')}});
  ok(r.l>=0&&r.r<=r.w,`Gel ${w}px: menu Mais dentro da tela (${Math.round(r.l)}–${Math.round(r.r)} de ${r.w})`);ok(r.ids==='btnSend,btnPdf,btnTools,btnGuide',`Gel ${w}px: menu Mais com Enviar, Fichas, Configuração e Guia`);await ctx.close()}
 console.log(errs.length?errs.length+' falha(s)':'sem erros');await b.close();if(errs.length)process.exitCode=1})();

// Gera "Guia de instalação.html" (raiz do repositório = raiz do ZIP) a partir de fontes/guia/guia_modelo.html.
// Tira prints reais das páginas (paginas/*.html) com moldura vermelha numerada onde clicar/preencher e embute as imagens no HTML
// (arquivo único: abre, imprime e pode ser enviado sozinho). Rodar de novo quando as telas mudarem:
//   node fontes/guia/gerar_guia.js
const path=require('path'),fs=require('fs'),http=require('http');const RAIZ=path.resolve(__dirname,'..','..');
const {chromium}=require('playwright');
const MODELO=path.join(__dirname,'guia_modelo.html'),SAIDA=path.join(RAIZ,'Guia de instalação.html');
const srv=http.createServer((q,r)=>{const f=path.join(RAIZ,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(RAIZ)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':'application/octet-stream'});fs.createReadStream(f).pipe(r)});
// desenha moldura numerada (e rótulo opcional) sobre elementos da página
const MARCA=alvos=>{document.querySelectorAll('.__mk').forEach(e=>e.remove());
  for(const [sel,n,txt] of alvos){const e=typeof sel==='string'?document.querySelector(sel):null;if(!e){console.warn('sem alvo',sel);continue}const r=e.getBoundingClientRect();
    const d=(st,html)=>{const x=document.createElement('div');x.className='__mk';Object.assign(x.style,{position:'fixed',zIndex:2147483000,pointerEvents:'none'},st);if(html!=null)x.textContent=html;document.body.appendChild(x);return x};
    d({left:r.left-5+'px',top:r.top-5+'px',width:r.width+10+'px',height:r.height+10+'px',border:'3px solid #e11d48',borderRadius:'8px',boxShadow:'0 0 0 4px rgba(225,29,72,.22)'});
    d({left:Math.max(2,r.left-17)+'px',top:Math.max(2,r.top-17)+'px',width:'26px',height:'26px',borderRadius:'50%',background:'#e11d48',color:'#fff',font:'700 15px/26px "Segoe UI",Arial,sans-serif',textAlign:'center'},String(n));
    if(txt){const l=d({left:Math.min(innerWidth-230,Math.max(4,r.left))+'px',top:(r.bottom+10)+'px',background:'#e11d48',color:'#fff',font:'600 13px/1.3 "Segoe UI",Arial,sans-serif',padding:'4px 9px',borderRadius:'6px',maxWidth:'220px'},txt)}}};
const FECHA=()=>document.querySelectorAll('.overlay,#toast,.toast').forEach(o=>{if(o.classList.contains('overlay'))o.remove();else o.style.display='none'});
(async()=>{await new Promise(r=>srv.listen(0,r));const U=`http://127.0.0.1:${srv.address().port}/paginas/`;
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1.25,colorScheme:'light'});
 await ctx.addInitScript(()=>{try{if(!sessionStorage.getItem('__g')){localStorage.clear();localStorage.setItem('vac.theme','light');sessionStorage.setItem('__g','1')}}catch(e){}});
 const IMG={};const erros=[];
 const nova=async(arq)=>{const p=await ctx.newPage();p.on('pageerror',e=>erros.push(arq+': '+e.message));p.on('dialog',d=>d.accept());await p.goto(U+encodeURI(arq));await p.waitForTimeout(1300);return p};
 // print de uma região (seletor do recorte ou retângulo), com margem
 const foto=async(p,nome,legenda,alvos,recorte,margem=14)=>{await p.evaluate(MARCA,alvos);await p.waitForTimeout(150);
   let clip=recorte;if(typeof recorte==='string'){const r=await p.evaluate(s=>{const e=document.querySelector(s);const x=e.getBoundingClientRect();return{x:x.left,y:x.top,width:x.width,height:x.height}},recorte);clip={x:Math.max(0,r.x-margem),y:Math.max(0,r.y-margem),width:Math.min(1280,r.width+2*margem),height:Math.min(800,r.height+2*margem)}}
   const buf=await p.screenshot({clip,type:'png'});IMG[nome]={b64:buf.toString('base64'),legenda};await p.evaluate(()=>document.querySelectorAll('.__mk').forEach(e=>e.remove()))};
 const versoes={};

 // ---- Portal: Entrar, ID, Escolher pasta
 const P=await nova('Portal.html');await P.evaluate(FECHA);versoes.Portal=await P.evaluate(()=>PAGE.versao);
 await foto(P,'portal-entrar','Portal · canto superior direito: clique em Entrar',[['#askUser',1]],{x:0,y:0,width:1280,height:100});
 await P.evaluate(()=>{try{Entrar.abrir()}catch(e){}});await P.waitForTimeout(400);await P.fill('#enId','1234').catch(()=>{});
 {const r=await P.evaluate(()=>{const m=document.querySelector('#enId').closest('.modal').querySelector('.mb').parentElement.getBoundingClientRect();return{x:m.left,y:m.top,width:m.width,height:m.height}});
  await foto(P,'portal-id','Janela Entrar: digite o seu ID do cadastro e clique em Entrar',[['#enId',2],['#enOk',3]],{x:Math.max(0,r.x-16),y:Math.max(0,r.y-16),width:Math.min(1280,r.width+32),height:Math.min(800,r.height+32)})}
 await P.evaluate(()=>{try{Modal.close()}catch(e){}document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'))});await P.evaluate(()=>App.show('config'));await P.waitForTimeout(500);
  {const r=await P.evaluate(()=>{const c=document.querySelector('#cPasta').closest('.card');const x=c.getBoundingClientRect();return{x:x.left,y:x.top,width:x.width,height:Math.min(x.height,150)}});await foto(P,'portal-pasta','⚙ Administração › Configuração do Portal › quadro Pasta da rede: clique em Escolher pasta',[['#cPasta',1]],{x:Math.max(0,r.x-12),y:Math.max(0,r.y-12),width:Math.min(1280,r.width+24),height:r.height+24})}

 // ---- Produção: Quem está usando? e Primeira configuração
 const O=await nova('OEE-Vacutainer.html');versoes['Produção']=await O.evaluate(()=>APP_VERSION);
 await O.fill('.overlay input','Ana Silva');
 await foto(O,'producao-nome','Produção · primeira abertura: digite o seu nome e clique em Usar este nome',[['.overlay input',1],['#uOk',2]],'.overlay .modal, .overlay > div',16).catch(async e=>{const r=await O.evaluate(()=>{const m=document.querySelector('.overlay').firstElementChild.getBoundingClientRect();return{x:m.left,y:m.top,width:m.width,height:m.height}});await foto(O,'producao-nome','Produção · primeira abertura: digite o seu nome e clique em Usar este nome',[['.overlay input',1],['#uOk',2]],{x:r.x-16,y:r.y-16,width:r.width+32,height:r.height+32})});
 await O.click('#uOk');await O.waitForTimeout(700);
 {const r=await O.evaluate(()=>{const m=document.querySelector('.overlay').firstElementChild.getBoundingClientRect();return{x:m.left,y:m.top,width:m.width,height:m.height}});
  await foto(O,'producao-pasta','Produção · Primeira configuração: clique em Escolher pasta da base',[['#wFolder',1]],{x:Math.max(0,r.x-16),y:Math.max(0,r.y-16),width:Math.min(1280,r.width+32),height:Math.min(800,r.height+32)})}

 // ---- Waste: Configuração › Escolher pasta da base
 const W=await nova('Perdas-Ordem.html');await W.evaluate(FECHA);versoes.Waste=await W.evaluate(()=>APP_VER);await W.evaluate(()=>showTab('config'));await W.waitForTimeout(500);
 {const r=await W.evaluate(()=>{const c=document.querySelector('#btnPasta').closest('.card');const x=c.getBoundingClientRect();return{x:x.left,y:x.top,width:x.width,height:Math.min(x.height,260)}});
  await foto(W,'waste-pasta','Waste · aba Configuração: clique em Escolher pasta da base',[['nav.vtabs [data-t=config]',1],['#btnPasta',2]],{x:0,y:0,width:1280,height:Math.min(800,r.y+Math.min(r.height,130)+16)})}

 // ---- Gel: Conectar à pasta (cabeçalho)
 const G=await nova('Gestão-Gel-Vacutainer.html');await G.evaluate(FECHA);versoes.Gel=await G.evaluate(()=>APP_VERSION);
 await G.evaluate(()=>{const b=[...document.querySelectorAll('#stBase button')].find(x=>/Conectar à pasta/.test(x.textContent));if(b)b.id='__gelCon'});
 await foto(G,'gel-pasta','Gestão de Gel · cabeçalho: clique em Conectar à pasta',[['#__gelCon',1]],{x:0,y:0,width:1280,height:150});

 // ---- Gel: janela "Base encontrada" depois de escolher a pasta (pasta de teste no armazenamento do navegador)
 {const g2=await nova('Gestão-Gel-Vacutainer.html');await g2.evaluate(FECHA);
  await g2.evaluate(async()=>{const r=await navigator.storage.getDirectory();for await(const[n]of r.entries())await r.removeEntry(n,{recursive:true});
    const B=await r.getDirectoryHandle('00. Bases',{create:true});const fh=await B.getFileHandle('fifo-base.json',{create:true});const s=await fh.createWritable();await s.write(await (await fetch('../testes/bases/fifo-base.json')).text());await s.close();
    await fsChooseBase(r)});
  await g2.waitForTimeout(500);
  const r=await g2.evaluate(()=>{const b=document.querySelector('#fsUseB');const m=b.closest('.dlg, .modal, [role=dialog]')||b.parentElement.parentElement;const x=m.getBoundingClientRect();return{x:x.left,y:x.top,width:x.width,height:x.height}});
  await foto(g2,'gel-base','Gestão de Gel · depois de escolher a pasta: clique em Usar a base da pasta',[['#fsUseB',1]],{x:Math.max(0,r.x-16),y:Math.max(0,r.y-16),width:Math.min(1280,r.width+32),height:Math.min(800,r.height+32)})}

 // ---- Paradas: Conectar a pasta da linha
 const A=await nova('Paradas.html');await A.evaluate(FECHA);versoes.Paradas=await A.evaluate(()=>PAGE.versao);
 await foto(A,'paradas-pasta','Paradas · Visão geral: clique em Conectar a pasta da linha (ou na pílula do cabeçalho)',[['#ivPasta',1],['#pPasta',2]],{x:0,y:0,width:1280,height:330});

 // ---- Portal conectado a uma pasta (sistema de arquivos do navegador): pílula "Base na pasta" e Versões das páginas
 {const p=await nova('Portal.html');
  await p.evaluate(async()=>{const r=await navigator.storage.getDirectory();for await(const[n]of r.entries())await r.removeEntry(n,{recursive:true});
    const w=async(d,n,t)=>{const fh=await d.getFileHandle(n,{create:true});const s=await fh.createWritable();await s.write(t);await s.close()};
    /* o armazenamento do navegador recusa 'ã' no nome: na pasta de teste o Gel usa o nome alternativo, que o Portal também reconhece */
    for(const [n,o] of [['Portal.html'],['OEE-Vacutainer.html'],['Perdas-Ordem.html'],['Gestão-Gel-Vacutainer.html','Gestao-Gel-Vacutainer.html'],['Paradas.html']])await w(r,o||n,await (await fetch(encodeURI(n))).text());
    const lib=await r.getDirectoryHandle('lib',{create:true});for(const n of ['xlsx.full.min.js','jspdf.umd.min.js','jspdf.plugin.autotable.min.js']){const x=await fetch('lib/'+n);await w(lib,n,x.ok?await x.text():'/* @version 0.20.3 */ XLSX.version="0.20.3";')}
    const B=await r.getDirectoryHandle('00. Bases',{create:true});
    for(const n of ['oee-vacutainer-base.json','perdas-base.json','fifo-base.json','paradas-base.json']){const x=await fetch('../testes/bases/'+n);await w(B,n,await x.text())}
    await w(B,'ordens-base.json',JSON.stringify({rev:1,competencias:{}}));await w(B,'vacutainer-cadastros.json',JSON.stringify({schema:'vac-cadastros',rev:1}));
    await Store.connect(r,{ask:false});await readModules(true);App.show('geral')});
  await p.waitForTimeout(800);await p.evaluate(()=>document.querySelectorAll('#toast,.toast').forEach(t=>t.style.display='none'));
  await foto(p,'portal-conectado','Conectado: o cabeçalho mostra a pílula verde Base na pasta',[['#stBase',1]],{x:0,y:40,width:1280,height:110});
  await p.evaluate(async()=>{App.show('config');await Vers.scan();App.render()});await p.waitForTimeout(900);
  await p.evaluate(()=>{document.querySelector('.vsuite').style.position='static';const c=document.querySelector('#cardVers');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-20)});await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const c=document.querySelector('#cardVers');const x=c.getBoundingClientRect();return{x:x.left,y:x.top,width:x.width,height:Math.min(x.height,560)}});
  const conf=await p.evaluate(()=>{const b=[...document.querySelectorAll('#cardVers button')].find(x=>/Conferir/.test(x.textContent));if(b){b.id='__conf';return true}return false});
  await foto(p,'portal-versoes','Portal › Versões das páginas: versões, lugar das bases e bibliotecas (exemplo com pasta de teste)',conf?[['#__conf',1]]:[],{x:Math.max(0,r.x-10),y:Math.max(0,r.y-10),width:Math.min(1280,r.width+20),height:r.height+20})}

 // ---- monta o HTML
 let h=fs.readFileSync(MODELO,'utf8');
 h=h.replace('{{VERSOES}}',`Portal ${versoes.Portal} · Produção ${versoes['Produção']} · Waste ${versoes.Waste} · Gel ${versoes.Gel} · Paradas ${versoes.Paradas}`);
 h=h.replace(/\{\{IMG:([a-z-]+)\}\}/g,(m,n)=>{const x=IMG[n];if(!x){erros.push('sem imagem: '+n);return ''}return `<figure><img alt="${x.legenda}" src="data:image/png;base64,${x.b64}"><figcaption>${x.legenda}</figcaption></figure>`});
 h=h.replace('<!-- Gerado por fontes/guia/gerar_guia.js','<!-- Gerado em '+new Date().toISOString().slice(0,10)+' por fontes/guia/gerar_guia.js');
 fs.writeFileSync(SAIDA,h);
 console.log('Guia gerado:',path.relative(RAIZ,SAIDA),(fs.statSync(SAIDA).size/1024).toFixed(0)+' KB ·',Object.keys(IMG).length,'prints');
 if(erros.length){console.log('Avisos:\n'+erros.join('\n'));process.exitCode=1}
 await b.close();srv.close()})();

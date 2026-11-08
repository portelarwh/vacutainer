const { chromium }=require('playwright');
const fs=require('fs');
const root='/workspace/verificacao-isolada-c3ae4b0';
(async()=>{
 const browser=await chromium.launch();const result={commit:'e0435136359847e07a2a775a1d7eea31371495b8',data:new Date().toISOString(),metodo:'Cópia isolada, HTTP local, dados fictícios, Chromium do ambiente'};
 const page=async name=>{const p=await browser.newPage({viewport:{width:1440,height:950}});p.on('dialog',d=>d.accept());await p.goto('file://'+root+'/paginas/'+encodeURI(name));await p.waitForTimeout(800);return p;};
 const ctx=await browser.newContext({timezoneId:'America/Sao_Paulo'});const dt=await ctx.newPage();await dt.clock.setFixedTime(new Date('2026-11-30T22:30:00-03:00'));await dt.goto('file://'+root+'/paginas/Paradas.html');await dt.waitForTimeout(600);
 result.B4=await dt.evaluate(()=>{localStorage.setItem('vac.cadastros',JSON.stringify({schema:'vac-cadastros',cambio:[{codigo:'USD',vigencias:[{de:'2026-11-01',ate:'2026-11-30',cotacao:5},{de:'2026-12-01',cotacao:6}]}]}));const vs=[{de:'2026-11-01',ate:'2026-11-30',valor:'novembro'},{de:'2026-12-01',valor:'dezembro'}];return{horaLocal:new Date().toString(),dataUTC:new Date().toISOString().slice(0,10),semData:vacVig(vs).valor,comDataDoFato:vacVig(vs,'2026-11-30').valor,cambioSemData:vacCambio()?.cotacao,cambioComData:vacCambio('2026-11-30')?.cotacao};});await ctx.close();
 const g=await page('Gestão-Gel-Vacutainer.html');await g.evaluate(()=>{enterDemo();openConfig('preco');});
 result.B5Interface=await g.evaluate(async()=>{
  const u=document.querySelector('#pcUsd'),fx=document.querySelector('#pcFx');let changes=null;
  const previous=backend.commit;backend.commit=async ch=>{changes=JSON.parse(JSON.stringify(ch));};
  u.value='12a';fx.value='5';u.dispatchEvent(new Event('input',{bubbles:true}));const preview=document.querySelector('#pcBrl').textContent;document.querySelector('#pcSave').click();await new Promise(r=>setTimeout(r,80));backend.commit=previous;
  return{tipoDoCampo:u.type,entrada:'12a',preview,tentativaDeSalvar:changes,erroNaTela:document.querySelector('#pcErr')?.textContent||''};
 });await g.close();
 const pa=await page('Paradas.html');result.buscaPorOrdemNoParadas=await pa.evaluate(()=>{Store.data.eventos=[{id:'AUD-ORDEM',dia:'2026-11-07',origem:'forms',turno:'T1',equipamento:'LINHA',codigo:'FME',minutos:5,descricao:'Verificação sintética',ordem:'110834720'}];Store.data.tecnico={};return{query:'110834720',resultados:buscaPagina('110834720').map(x=>({tipo:x.tipo,txt:x.txt,sub:x.sub}))};});await pa.close();
 const o=await page('OEE-Vacutainer.html');await o.evaluate(()=>{document.querySelectorAll('.overlay').forEach(x=>x.remove());Demo.enterExample();});
 result.passagemDeTurno=await o.evaluate(()=>{const day=db().productionDays.find(d=>d.shifts?.length);const shift=day.shifts[0];shift.note='AUDITORIA-OBSERVACAO-PROXIMO-TURNO';const model=rpShiftModel({date:day.date,psId:shift.id});return{titulo:model.title,observacaoRegistrada:shift.note,observacaoNoRelatorio:JSON.stringify(model.blocks).includes(shift.note),blocos:model.blocks.map(x=>x.l)};});
 result.FY27=await o.evaluate(()=>{const old=Store.S.cadDoc;const build=()=>{const r=document.createElement('div');r.innerHTML=Cfg.importacao.render();Cfg.importacao.mount(r);return{botaoLocal:!!r.querySelector('#imMeta'),atalhoPortal:[...r.querySelectorAll('a')].map(a=>({texto:a.textContent,href:a.getAttribute('href')})).filter(a=>a.href.includes('metaoee'))};};Store.S.cadDoc=null;const semCad=build();Store.S.cadDoc={schema:'vac-cadastros',rev:1,metasOee:[{codigo:'M1',ativo:true,vigencias:[]}]};const comCad=build();Store.S.cadDoc=old;return{semMetasPortal:semCad,comMetasPortal:comCad};});
 result.B1Carregar=await o.evaluate(async()=>{
  const oldget=IDB.get;IDB.get=async k=>k==='ordens'?{schema:'vac-ordens',schemaVersion:1,rev:7,revId:'cache',competencias:{'2026-10':{marca:'copia-antiga'}},auditoria:[]}:oldget(k);
  const dir={name:'simulada',__vacRaiz:true,async getFileHandle(){throw Object.assign(new Error('leitura indisponível'),{name:'NotReadableError'});}};
  Store.S.mode='pasta';Store.S.backend=FolderBackend(dir);Ord.B=null;Ord.carregado=false;await Ord.carregar(true);const r={erro:Ord.err,carregado:Ord.carregado,rev:Ord.B.rev,competencias:Object.keys(Ord.B.competencias)};
  Store.S.mode='local';Store.S.backend=null;IDB.get=oldget;return r;
 });await o.close();
 const portal=await page('Portal.html');result.avisoDeVersao=await portal.evaluate(()=>{const r={id:'perdas',nome:'Waste',html:{v:'1.8.16'},htmls:[{}],bases:[{}],base:{app:'1.8.15',rev:1,exports:true,expV:1}};return Vers.avisos(r).map(x=>x[1]);});await portal.close();
 result.perfis=[];
 for(const [mod,name,selector]of [['perdas','Perdas-Ordem.html','nav.vtabs [data-t="importar"]'],['gel','Gestão-Gel-Vacutainer.html','#btnImport'],['paradas','Paradas.html','nav.vtabs [data-t="importar"]']]){
  const p=await page(name);result.perfis.push(await p.evaluate(({mod,selector})=>{localStorage.setItem('vac.cadastros',JSON.stringify({schema:'vac-cadastros',usuarios:[{codigo:'AUD-U',nome:'Auditoria',perfil:'AUD-P'}],perfis:[{codigo:'AUD-P',nome:'Auditoria',permissoes:{[mod]:{ver:true,importar:false,configurar:false,lancar:false}}}]}));localStorage.setItem('vac.userId','AUD-U');renderSysNav();const b=document.querySelector(selector);return{mod,podeImportar:vacPode(mod,'importar'),controleExiste:!!b,controleVisivel:!!b&&getComputedStyle(b).display!=='none'&&!b.hidden,controleDesabilitado:!!b?.disabled};},{mod,selector}));await p.close();
 }
 fs.writeFileSync('/workspace/revisao-final-vacutainer/evidencias/verificacao-complementar.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
